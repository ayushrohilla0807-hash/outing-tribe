import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "../models/profile";

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
    gender: (profile?.gender as "Male" | "Female" | "Other") || "Other",
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

export async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
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

  if (updates.interests !== undefined) {
    await supabase.auth.updateUser({
      data: {
        interests: updates.interests,
        full_name: updates.name ? updates.name.trim() : user.user_metadata?.full_name,
        avatar_url: updates.avatarUrl || user.user_metadata?.avatar_url,
      },
    });
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

export async function uploadAvatar(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `avatar-${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("outing-image").upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("outing-image").getPublicUrl(fileName);

  return data.publicUrl;
}
