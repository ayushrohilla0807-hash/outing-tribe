import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for the current Terms and Privacy Policy version.
 * When substantial updates are made, increment this version (e.g., "1.1" or "2.0")
 * to automatically require users to review and re-accept.
 */
export const CURRENT_TERMS_VERSION = "1.0";

export interface UserWithMetadata {
  user_metadata?: {
    terms_version?: string;
    terms_accepted_at?: string;
    [key: string]: unknown;
  } | null;
}

/**
 * Checks if a user has accepted the current version of Terms and Privacy Policy.
 */
export function hasAcceptedCurrentTerms(user: UserWithMetadata | null | undefined): boolean {
  if (!user || !user.user_metadata) return false;
  return user.user_metadata.terms_version === CURRENT_TERMS_VERSION;
}

/**
 * Persists the user's acceptance of the current Terms version in Supabase user metadata.
 */
export async function recordTermsAcceptance(): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase.auth.updateUser({
    data: {
      terms_accepted_at: now,
      terms_version: CURRENT_TERMS_VERSION,
    },
  });

  if (error) {
    throw error;
  }
}
