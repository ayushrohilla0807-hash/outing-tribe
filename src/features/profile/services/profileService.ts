import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "../models/profile";

export async function getProfile(): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

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

  // Real saved count
  const { count: savedCount } = await supabase
    .from("saved_outings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return {
    id: user.id,
    name: profile?.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    phone: "",
    age: age > 0 ? age : 0,
    gender: (profile?.gender as "Male" | "Female" | "Other") || "Other",
    state: "",
    city: profile?.city || "",
    bio: profile?.bio || "",
    avatarUrl:
      profile?.avatar_url ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    interests: Array.isArray(profile?.interests) ? profile.interests : [],
    hostRating: 5.0,
    hostedCount: hostedCount || 0,
    joinedCount: joinedCount || 0,
    savedCount: savedCount || 0,
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

  const payload: Record<string, any> = {};

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
}

/** Persist interests and mark profile setup as complete. */
export async function updateInterests(interests: string[]): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ interests, profile_setup_complete: true })
    .eq("id", user.id);

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

  const payload: Record<string, any> = {
    full_name: data.name.trim(),
    city: data.city.trim(),
    date_of_birth: `${birthYear}-01-01`,
    interests: data.interests,
    profile_setup_complete: true,
  };

  if (data.avatarUrl) payload.avatar_url = data.avatarUrl;

  const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);

  if (error) {
    console.error("Error completing profile setup:", error);
    throw error;
  }
}

/** Returns true if the user needs to go through the profile setup wizard. */
export async function needsProfileSetup(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_setup_complete, city, interests")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return true;

  // Consider setup done if the flag is set OR legacy users have city + 3+ interests
  if (profile.profile_setup_complete) return false;
  const hasCity = Boolean(profile.city);
  const hasInterests = Array.isArray(profile.interests) && profile.interests.length >= 3;
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
