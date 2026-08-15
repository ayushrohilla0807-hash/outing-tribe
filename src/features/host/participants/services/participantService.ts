import { supabase } from "@/integrations/supabase/client";
import type { Participant } from "../models/participant";

function calculateAge(dateOfBirth: string | null): number {
  if (!dateOfBirth) return 0;

  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age > 0 ? age : 0;
}

export async function getParticipants(outingId: string): Promise<Participant[]> {
  const { data: participantRows, error } = await supabase
    .from("participants")
    .select("*")
    .eq("outing_id", outingId)
    .order("joined_at", { ascending: true });

  if (error) throw error;

  if (!participantRows?.length) {
    return [];
  }

  const userIds = participantRows.map((p) => p.user_id);

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      city,
      date_of_birth
    `,
    )
    .in("id", userIds);

  if (profileError) throw profileError;

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return participantRows.map((participant): Participant => {
    const profile = profileMap.get(participant.user_id);

    return {
      id: participant.id,
      userId: participant.user_id,
      outingId: participant.outing_id,
      name: profile?.full_name ?? "User",
      age: calculateAge(profile?.date_of_birth ?? null),
      city: profile?.city ?? "",
      avatar:
        profile?.avatar_url ??
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      interests: [],
      joinedAt: participant.joined_at
        ? new Date(participant.joined_at).toLocaleDateString()
        : "Recently",
      status: participant.status === "joined" ? "joined" : "pending",
    };
  });
}

export async function acceptParticipant(participantId: string, outingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Verify host ownership and capacity
  const { data: outing, error: outingError } = await supabase
    .from("outings")
    .select("id, host_id, max_participants")
    .eq("id", outingId)
    .single();

  if (outingError || !outing) throw new Error("Outing not found");
  if (outing.host_id !== user.id)
    throw new Error("Unauthorized: Only the host can accept requests");

  // Check current joined count
  const { count: joinedCount, error: countError } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("outing_id", outingId)
    .eq("status", "joined");

  if (countError) throw countError;
  if ((joinedCount ?? 0) >= outing.max_participants) {
    throw new Error("This outing has reached maximum participant capacity");
  }

  const { error } = await supabase
    .from("participants")
    .update({
      status: "joined",
    })
    .eq("id", participantId);

  if (error) throw error;
}

export async function rejectParticipant(participantId: string, outingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId)
    .eq("outing_id", outingId);

  if (error) throw error;
}

export async function removeParticipant(participantId: string, outingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId)
    .eq("outing_id", outingId);

  if (error) throw error;
}
