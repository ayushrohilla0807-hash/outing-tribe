import { supabase } from "@/integrations/supabase/client";

export const BUCKET_NAME = "outing-image";

export interface CleanupLog {
  operation: string;
  targetId?: string;
  paths?: string[];
  status: "success" | "failed" | "skipped";
  reclaimedCount?: number;
  error?: string;
  timestamp: string;
}

/**
 * Structured logger for image storage lifecycle operations.
 * Logs operation details for observability without leaking sensitive user data.
 */
export function logCleanupAction(context: {
  operation: string;
  targetId?: string;
  paths?: string[];
  status: "success" | "failed" | "skipped";
  reclaimedCount?: number;
  error?: any;
}) {
  const entry: CleanupLog = {
    operation: context.operation,
    targetId: context.targetId,
    paths: context.paths,
    status: context.status,
    reclaimedCount: context.reclaimedCount,
    error: context.error ? String(context.error.message || context.error) : undefined,
    timestamp: new Date().toISOString(),
  };

  if (context.status === "failed") {
    console.error("[ImageStorageLifecycle]", entry);
  } else {
    console.info("[ImageStorageLifecycle]", entry);
  }

  return entry;
}

/**
 * Extracts the storage relative path (e.g. "outings/123/card.webp") from a full public URL or path.
 * Returns null if the URL is external (e.g. Unsplash) or not part of this Supabase Storage bucket.
 */
export function extractStoragePath(urlOrPath?: string | null): string | null {
  if (!urlOrPath || typeof urlOrPath !== "string") return null;

  const trimmed = urlOrPath.trim();
  if (!trimmed) return null;

  // If already a relative storage path (e.g. "outings/..." or "avatars/...")
  if (
    trimmed.startsWith("outings/") ||
    trimmed.startsWith("avatars/") ||
    trimmed.startsWith("chat-attachments/") ||
    trimmed.startsWith("temp/")
  ) {
    return trimmed;
  }

  // Check if it's a Supabase public storage URL
  // Format: .../storage/v1/object/public/outing-image/<path>
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const idx = trimmed.indexOf(marker);
  if (idx !== -1) {
    const rawPath = trimmed.substring(idx + marker.length);
    // Strip query parameters if any
    return rawPath.split("?")[0].replace(/^\/+/, "");
  }

  // Format: .../storage/v1/render/image/public/outing-image/<path>
  const renderMarker = `/storage/v1/render/image/public/${BUCKET_NAME}/`;
  const renderIdx = trimmed.indexOf(renderMarker);
  if (renderIdx !== -1) {
    const rawPath = trimmed.substring(renderIdx + renderMarker.length);
    return rawPath.split("?")[0].replace(/^\/+/, "");
  }

  // External URL (e.g. Unsplash, placeholder, data URL)
  return null;
}

/**
 * Returns all 3 variant paths (hero.webp, card.webp, thumb.webp) for an outing cover URL or storage path.
 */
export function getOutingImageVariantPaths(urlOrPath?: string | null): string[] {
  const path = extractStoragePath(urlOrPath);
  if (!path) return [];

  // Match folder format: "outings/<id>/<file>.webp" or "outings/<id>"
  const folderMatch = path.match(/^outings\/([^/]+)/);
  if (folderMatch) {
    const folder = `outings/${folderMatch[1]}`;
    return [`${folder}/hero.webp`, `${folder}/card.webp`, `${folder}/thumb.webp`];
  }

  return [path];
}

/**
 * Returns all variant paths (avatar.webp, thumb.webp) for an avatar URL or storage path.
 */
export function getAvatarImageVariantPaths(urlOrPath?: string | null): string[] {
  const path = extractStoragePath(urlOrPath);
  if (!path) return [];

  // Match folder format: "avatars/<id>/<file>.webp" or "avatars/<id>"
  const folderMatch = path.match(/^avatars\/([^/]+)/);
  if (folderMatch) {
    const folder = `avatars/${folderMatch[1]}`;
    return [`${folder}/avatar.webp`, `${folder}/thumb.webp`];
  }

  return [path];
}

/**
 * Safely and idempotently deletes files from Supabase Storage.
 * Treats missing or already deleted files as success.
 * Never throws an error that crashes application flows; returns success status and logs errors.
 */
export async function deleteStorageFiles(
  paths: string[],
): Promise<{ success: boolean; deletedCount: number; error?: any }> {
  const validPaths = Array.from(new Set(paths.filter(Boolean)));
  if (validPaths.length === 0) {
    return { success: true, deletedCount: 0 };
  }

  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).remove(validPaths);

    if (error) {
      logCleanupAction({
        operation: "deleteStorageFiles",
        paths: validPaths,
        status: "failed",
        error,
      });
      return { success: false, deletedCount: 0, error };
    }

    const deletedCount = data?.length ?? validPaths.length;
    logCleanupAction({
      operation: "deleteStorageFiles",
      paths: validPaths,
      status: "success",
      reclaimedCount: deletedCount,
    });

    return { success: true, deletedCount };
  } catch (err: any) {
    logCleanupAction({
      operation: "deleteStorageFiles",
      paths: validPaths,
      status: "failed",
      error: err,
    });
    return { success: false, deletedCount: 0, error: err };
  }
}

/**
 * Safely deletes all variant images belonging to an outing.
 */
export async function deleteOutingImages(urlOrPath?: string | null): Promise<boolean> {
  const variantPaths = getOutingImageVariantPaths(urlOrPath);
  if (variantPaths.length === 0) {
    logCleanupAction({
      operation: "deleteOutingImages",
      paths: [],
      status: "skipped",
    });
    return true;
  }

  const { success } = await deleteStorageFiles(variantPaths);
  return success;
}

/**
 * Safely deletes all avatar variant images belonging to a user profile.
 */
export async function deleteAvatarImages(urlOrPath?: string | null): Promise<boolean> {
  const variantPaths = getAvatarImageVariantPaths(urlOrPath);
  if (variantPaths.length === 0) {
    logCleanupAction({
      operation: "deleteAvatarImages",
      paths: [],
      status: "skipped",
    });
    return true;
  }

  const { success } = await deleteStorageFiles(variantPaths);
  return success;
}
