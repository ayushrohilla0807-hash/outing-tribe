import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  BUCKET_NAME,
  extractStoragePath,
  getOutingImageVariantPaths,
  getAvatarImageVariantPaths,
  logCleanupAction,
} from "@/lib/imageStorageService";

export interface StorageFileMeta {
  path: string;
  name: string;
  id?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrphanReport {
  timestamp: string;
  retentionHours: number;
  totalFilesScanned: number;
  activeReferencedFilesCount: number;
  recentProtectedFilesCount: number;
  orphanCandidatesCount: number;
  reclaimableBytes: number;
  orphanCandidates: Array<{
    path: string;
    size: number;
    createdAt?: string;
    reason: string;
  }>;
}

export interface CleanupResult extends OrphanReport {
  dryRun: boolean;
  deletedFilesCount: number;
  reclaimedBytes: number;
  status: "success" | "partial" | "failed";
}

/**
 * Recursively lists all files in a Supabase Storage bucket.
 */
async function listAllStorageFiles(prefix = ""): Promise<StorageFileMeta[]> {
  const results: StorageFileMeta[] = [];

  const { data: entries, error } = await supabaseAdmin.storage.from(BUCKET_NAME).list(prefix, {
    limit: 500,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    console.error(`[OrphanCleanup] Failed to list prefix "${prefix}":`, error);
    return results;
  }

  if (!entries || entries.length === 0) {
    return results;
  }

  for (const entry of entries) {
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;

    // In Supabase storage, folders often have null id or metadata without mimetype/size
    const isFolder = entry.id === null || (!entry.metadata?.mimetype && !entry.metadata?.size);

    if (isFolder) {
      const subEntries = await listAllStorageFiles(fullPath);
      results.push(...subEntries);
    } else {
      results.push({
        path: fullPath,
        name: entry.name,
        id: entry.id,
        size: entry.metadata?.size ?? 0,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
      });
    }
  }

  return results;
}

/**
 * Server-side function to scan Supabase Storage and detect unreferenced orphan images.
 * Safe & non-destructive by default.
 */
export async function scanStorageOrphans(
  options: { retentionHours?: number } = {},
): Promise<OrphanReport> {
  const retentionHours = options.retentionHours ?? 24;
  const cutoffTime = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

  // 1. Fetch all active DB references using supabaseAdmin
  const [outingsRes, profilesRes] = await Promise.all([
    supabaseAdmin.from("outings").select("id, cover_image"),
    supabaseAdmin.from("profiles").select("id, avatar_url"),
  ]);

  if (outingsRes.error) throw outingsRes.error;
  if (profilesRes.error) throw profilesRes.error;

  // 2. Build complete set of all valid referenced paths (including all variants)
  const referencedPaths = new Set<string>();

  for (const outing of outingsRes.data || []) {
    if (outing.cover_image) {
      const variants = getOutingImageVariantPaths(outing.cover_image);
      variants.forEach((p) => referencedPaths.add(p));
    }
  }

  for (const profile of profilesRes.data || []) {
    if (profile.avatar_url) {
      const variants = getAvatarImageVariantPaths(profile.avatar_url);
      variants.forEach((p) => referencedPaths.add(p));
    }
  }

  // 3. Recursively list all files in storage bucket
  const storageFiles = await listAllStorageFiles();

  const orphanCandidates: OrphanReport["orphanCandidates"] = [];
  let recentProtectedCount = 0;
  let activeReferencedCount = 0;
  let reclaimableBytes = 0;

  for (const file of storageFiles) {
    const isReferenced = referencedPaths.has(file.path);

    if (isReferenced) {
      activeReferencedCount++;
      continue;
    }

    // Check creation/updated time for safe retention window
    const fileTime = file.createdAt
      ? new Date(file.createdAt)
      : file.updatedAt
        ? new Date(file.updatedAt)
        : null;
    const isRecent = fileTime && fileTime > cutoffTime;

    if (isRecent) {
      recentProtectedCount++;
      continue;
    }

    // File is unreferenced and older than retention window -> genuine orphan candidate
    const size = file.size || 0;
    reclaimableBytes += size;
    orphanCandidates.push({
      path: file.path,
      size,
      createdAt: file.createdAt,
      reason: "Unreferenced storage object older than retention window",
    });
  }

  return {
    timestamp: new Date().toISOString(),
    retentionHours,
    totalFilesScanned: storageFiles.length,
    activeReferencedFilesCount: activeReferencedCount,
    recentProtectedFilesCount: recentProtectedCount,
    orphanCandidatesCount: orphanCandidates.length,
    reclaimableBytes,
    orphanCandidates,
  };
}

/**
 * Server-side maintenance function to clean up confirmed orphan images.
 * Runs in dryRun mode by default unless explicitly specified.
 */
export async function cleanupStorageOrphans(
  options: {
    retentionHours?: number;
    dryRun?: boolean;
  } = {},
): Promise<CleanupResult> {
  const dryRun = options.dryRun ?? true;
  const report = await scanStorageOrphans({ retentionHours: options.retentionHours });

  if (dryRun || report.orphanCandidates.length === 0) {
    return {
      ...report,
      dryRun,
      deletedFilesCount: 0,
      reclaimedBytes: 0,
      status: "success",
    };
  }

  const pathsToDelete = report.orphanCandidates.map((c) => c.path);
  let deletedCount = 0;
  let reclaimedBytes = 0;

  // Process deletions in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < pathsToDelete.length; i += BATCH_SIZE) {
    const batch = pathsToDelete.slice(i, i + BATCH_SIZE);
    try {
      const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove(batch);
      if (error) {
        logCleanupAction({
          operation: "cleanupStorageOrphans",
          paths: batch,
          status: "failed",
          error,
        });
      } else {
        const batchDeleted = data?.length ?? batch.length;
        deletedCount += batchDeleted;
        logCleanupAction({
          operation: "cleanupStorageOrphans",
          paths: batch,
          status: "success",
          reclaimedCount: batchDeleted,
        });
      }
    } catch (err) {
      logCleanupAction({
        operation: "cleanupStorageOrphans",
        paths: batch,
        status: "failed",
        error: err,
      });
    }
  }

  // Calculate successfully reclaimed bytes
  const deletedSet = new Set(pathsToDelete.slice(0, deletedCount));
  for (const candidate of report.orphanCandidates) {
    if (deletedSet.has(candidate.path)) {
      reclaimedBytes += candidate.size;
    }
  }

  return {
    ...report,
    dryRun: false,
    deletedFilesCount: deletedCount,
    reclaimedBytes,
    status: deletedCount === pathsToDelete.length ? "success" : "partial",
  };
}
