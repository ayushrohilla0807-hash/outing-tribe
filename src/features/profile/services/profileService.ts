import { supabase } from "@/integrations/supabase/client";
import { deleteAvatarImages, extractStoragePath } from "@/lib/imageStorageService";
import type { UserProfile } from "../models/profile";
import type { HostedOuting } from "@/features/host/dashboard/models/hostedOuting";
import type { HistoryOuting, HistoryStatus } from "@/features/outing/history/models/history";

function getLocalSavedCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("outsy_saved_outings");
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export async function getProfile(): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: fetchProfile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile = fetchProfile;

  if (error) {
    console.error("Error fetching profile:", error);
  }

  // Graceful self-healing fallback if profile row was not created yet
  if (!profile) {
    const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Outsy User";
    const fallbackAvatar = user.user_metadata?.avatar_url || null;

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fallbackName,
        avatar_url: fallbackAvatar,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating fallback profile:", insertError);
    } else {
      profile = newProfile;
    }
  }

  // Calculate age from date_of_birth
  let age = 0;
  if (profile?.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    const today = new Date();

    age = today.getFullYear() - dob.getFullYear();
    const month = today.getMonth() - dob.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
  }

  // Real hosted count
  const { count: hostedCount } = await supabase
    .from("outings")
    .select("id", { count: "exact", head: true })
    .eq("host_id", user.id);

  // Real joined count
  const { count: joinedCount } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "joined");

  const savedCount = getLocalSavedCount();
  const metaInterests = user.user_metadata?.interests;
  const interests = Array.isArray(metaInterests) ? metaInterests : [];

  return {
    id: user.id,
    name:
      profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    phone: "",
    age: age > 0 ? age : 0,
    gender:
      (profile?.gender as UserProfile["gender"]) ||
      user.user_metadata?.gender ||
      "Prefer not to say",
    state: "",
    city: profile?.city || "",
    bio: profile?.bio || "",
    avatarUrl:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    interests,
    hostRating: 5.0,
    hostedCount: hostedCount || 0,
    joinedCount: joinedCount || 0,
    savedCount,
    verified: true,
  };
}

/**
 * Fetches a public user profile by userId.
 * Strictly excludes private fields like email, phone, authentication metadata.
 */
export async function getPublicProfile(userId: string): Promise<UserProfile> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, city, gender, date_of_birth, interests")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching public profile:", error);
    throw error;
  }

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Calculate age from date_of_birth
  let age = 0;
  if (profile.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    const today = new Date();

    age = today.getFullYear() - dob.getFullYear();
    const month = today.getMonth() - dob.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
  }

  // Real hosted count
  const { count: hostedCount } = await supabase
    .from("outings")
    .select("id", { count: "exact", head: true })
    .eq("host_id", userId)
    .neq("status", "cancelled");

  // Real joined count
  const { count: joinedCount } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "joined");

  const rawInterests = profile.interests;
  const interests = Array.isArray(rawInterests) ? rawInterests : [];

  return {
    id: profile.id,
    name: profile.full_name || "Outsy Member",
    email: "", // Excluded for privacy
    phone: "", // Excluded for privacy
    age: age > 0 ? age : 0,
    gender: (profile.gender as UserProfile["gender"]) || "",
    state: "",
    city: profile.city || "",
    bio: profile.bio || "",
    avatarUrl:
      profile.avatar_url ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    interests,
    hostRating: 5.0,
    hostedCount: hostedCount || 0,
    joinedCount: joinedCount || 0,
    savedCount: 0, // Saved outings are private to each user
    verified: true,
  };
}

/**
 * Fetches public hosted outings for a specific user ID.
 */
export async function getUserHostedOutings(userId: string): Promise<HostedOuting[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("outings")
    .select(
      `
      *,
      participants (
        id,
        status
      )
    `,
    )
    .eq("host_id", userId)
    .neq("status", "cancelled")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error fetching user hosted outings:", error);
    return [];
  }

  return (
    data?.map((item: any) => {
      const participants = (item.participants as any[]) || [];
      const joinedCount = participants.filter((p) => p.status === "joined").length;
      const pendingCount = participants.filter((p) => p.status === "pending").length;

      return {
        id: item.id,
        title: item.title,
        category: item.category,
        image: item.cover_image ?? "",
        location: item.location,
        date: item.outing_date,
        time: item.start_time,
        joined: joinedCount,
        pending: pendingCount,
        capacity: item.max_participants,
        status: item.status,
      };
    }) ?? []
  );
}

/**
 * Fetches public joined outings for a specific user ID.
 */
export async function getUserJoinedOutings(userId: string): Promise<HistoryOuting[]> {
  if (!userId) return [];

  const { data: participations, error: partError } = await supabase
    .from("participants")
    .select("outing_id, status")
    .eq("user_id", userId)
    .eq("status", "joined");

  if (partError || !participations || participations.length === 0) {
    return [];
  }

  const outingIds = participations.map((p) => p.outing_id);

  const { data: outingsData, error: outingsError } = await supabase
    .from("outings")
    .select("*")
    .in("id", outingIds)
    .neq("status", "cancelled")
    .order("outing_date", { ascending: false });

  if (outingsError || !outingsData || outingsData.length === 0) {
    return [];
  }

  // Batch fetch host profiles
  const allHostIds = Array.from(new Set(outingsData.map((o) => o.host_id).filter(Boolean)));
  let profileMap = new Map<string, string>();
  if (allHostIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", allHostIds);

    if (profiles) {
      profileMap = new Map(profiles.map((p) => [p.id, p.full_name || "Host"]));
    }
  }

  return outingsData.map((outing) => {
    let status: HistoryStatus = "joined";
    if (outing.status === "completed") status = "completed";

    return {
      id: outing.id,
      title: outing.title,
      location: outing.location,
      date: `${outing.outing_date} • ${outing.start_time}`,
      host: profileMap.get(outing.host_id) || "Host",
      image:
        outing.cover_image ||
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&auto=format&fit=crop&q=80",
      status,
      participants: 0,
    };
  });
}

export async function updateProfile(
  updates: Partial<UserProfile>,
  previousAvatarUrl?: string | null,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const payload: {
    full_name?: string;
    bio?: string | null;
    city?: string | null;
    gender?: string | null;
    avatar_url?: string | null;
    date_of_birth?: string | null;
  } = {};

  if (updates.name !== undefined) payload.full_name = updates.name.trim();
  if (updates.bio !== undefined) payload.bio = updates.bio.trim();
  if (updates.city !== undefined) payload.city = updates.city.trim();
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

  // Approximate date_of_birth if age was modified
  if (updates.age && updates.age > 0) {
    const today = new Date();
    const birthYear = today.getFullYear() - updates.age;
    payload.date_of_birth = `${birthYear}-01-01`;
  }

  const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  const authMetadataUpdates: Record<string, any> = {};
  if (updates.interests !== undefined) authMetadataUpdates.interests = updates.interests;
  if (updates.name !== undefined) authMetadataUpdates.full_name = updates.name.trim();
  if (updates.avatarUrl !== undefined) authMetadataUpdates.avatar_url = updates.avatarUrl;
  if (updates.city !== undefined) authMetadataUpdates.city = updates.city.trim();
  if (updates.gender !== undefined) authMetadataUpdates.gender = updates.gender;

  if (Object.keys(authMetadataUpdates).length > 0) {
    await supabase.auth.updateUser({
      data: authMetadataUpdates,
    });
  }

  // Safe avatar cleanup: Only delete previous avatar images if avatar was updated and DB update succeeded
  if (previousAvatarUrl && updates.avatarUrl && previousAvatarUrl !== updates.avatarUrl) {
    const oldPath = extractStoragePath(previousAvatarUrl);
    const newPath = extractStoragePath(updates.avatarUrl);

    if (oldPath && oldPath !== newPath) {
      try {
        await deleteAvatarImages(previousAvatarUrl);
      } catch (cleanupErr) {
        console.error("[updateProfile] Failed to clean up old avatar:", cleanupErr);
      }
    }
  }
}

/** Persist interests and mark profile setup as complete. */
export async function updateInterests(interests: string[]): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.auth.updateUser({
    data: {
      interests,
      profile_setup_complete: true,
    },
  });

  if (error) {
    console.error("Error updating interests:", error);
    throw error;
  }
}

/** Complete the full profile setup in one call. */
export async function completeProfileSetup(data: {
  name: string;
  age: number;
  gender: string;
  city: string;
  avatarUrl?: string;
  interests: string[];
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const today = new Date();
  const birthYear = today.getFullYear() - data.age;

  const payload = {
    full_name: data.name.trim(),
    city: data.city.trim(),
    gender: data.gender,
    date_of_birth: `${birthYear}-01-01`,
    avatar_url: data.avatarUrl || user.user_metadata?.avatar_url || null,
  };

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    ...payload,
  });

  if (profileError) {
    console.error("Error completing profile setup (profile row):", profileError);
    throw profileError;
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: data.name.trim(),
      avatar_url: data.avatarUrl,
      interests: data.interests,
      city: data.city.trim(),
      gender: data.gender,
      profile_setup_complete: true,
    },
  });

  if (authError) {
    console.error("Error completing profile setup (auth metadata):", authError);
    throw authError;
  }
}

/** Returns true if the user needs to go through the profile setup wizard. */
export async function needsProfileSetup(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Check auth user metadata first
  if (user.user_metadata?.profile_setup_complete) {
    return false;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("city, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return true;

  const metaInterests = user.user_metadata?.interests;
  const hasInterests = Array.isArray(metaInterests) && metaInterests.length >= 3;
  const hasCity = Boolean(profile.city);

  return !(hasCity && hasInterests);
}

import { uploadOptimizedAvatar } from "@/lib/imageOptimization";

export async function uploadAvatar(file: File, userId?: string): Promise<string> {
  const uniqueFolder = userId ? `${userId}-${Date.now()}` : undefined;
  return uploadOptimizedAvatar(file, uniqueFolder);
}
