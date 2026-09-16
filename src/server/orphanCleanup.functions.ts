import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scanStorageOrphans, cleanupStorageOrphans } from "./orphanCleanup.server";

/**
 * Server Function: Get Orphan Storage Report
 * Scans Supabase Storage without making destructive changes.
 */
export const getOrphanStorageReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d?: { retentionHours?: number }) => d || {})
  .handler(async ({ data }) => {
    return scanStorageOrphans({ retentionHours: data?.retentionHours });
  });

/**
 * Server Function: Run Orphan Storage Cleanup
 * Performs safe batch deletion of confirmed orphans older than retention window.
 */
export const runOrphanStorageCleanup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d?: { retentionHours?: number; dryRun?: boolean }) => d || {})
  .handler(async ({ data }) => {
    return cleanupStorageOrphans({
      retentionHours: data?.retentionHours,
      dryRun: data?.dryRun,
    });
  });
