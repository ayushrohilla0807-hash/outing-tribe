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

/* =========================
   ACCEPT PARTICIPANT
========================= */

export async function acceptParticipant(participantId: string, outingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  console.log("[acceptParticipant] Initiating mutation:", {
    participantId,
    outingId,
    hostUserId: user.id,
  });

  const { data, error } = await supabase
    .from("participants")
    .update({
      status: "joined",
    })
    .eq("id", participantId)
    .select();

  console.log("[acceptParticipant] Supabase response:", { data, error });

  if (error) {
    console.error("[acceptParticipant] Supabase error:", error);
    throw new Error(error.message || "Failed to update participant in database");
  }

  if (!data || data.length === 0) {
    const errorMsg = `Database update blocked: 0 rows modified for participant ID ${participantId}. Check that the Supabase 'Hosts can update participant status' RLS policy is applied.`;
    console.error(`[acceptParticipant] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const updatedParticipant = data[0];

  // Sync to group_members: ensure group exists and add participant
  try {
    const { data: group } = await supabase
      .from("group_conversations")
      .select("id")
      .eq("outing_id", outingId)
      .maybeSingle();

    let groupId = group?.id;
    if (!groupId) {
      const { data: newGroup } = await supabase
        .from("group_conversations")
        .insert({ outing_id: outingId })
        .select("id")
        .maybeSingle();
      groupId = newGroup?.id;
    }

    if (groupId && updatedParticipant.user_id) {
      await supabase
        .from("group_members")
        .upsert(
          {
            group_id: groupId,
            user_id: updatedParticipant.user_id,
            role: "member",
          },
          { onConflict: "group_id,user_id", ignoreDuplicates: true },
        );
    }
  } catch (err) {
    console.error("[acceptParticipant] Group sync fallback error:", err);
  }

  console.log("[acceptParticipant] Success:", updatedParticipant);
  return updatedParticipant;
}

/* =========================
   REJECT PARTICIPANT
========================= */

export async function rejectParticipant(participantId: string, outingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  console.log("[rejectParticipant] Initiating mutation:", {
    participantId,
    outingId,
    hostUserId: user.id,
  });

  const { data, error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId)
    .select();

  console.log("[rejectParticipant] Supabase response:", { data, error });

  if (error) {
    console.error("[rejectParticipant] Supabase error:", error);
    throw new Error(error.message || "Failed to delete participant in database");
  }

  if (!data || data.length === 0) {
    const errorMsg = `Database delete blocked: 0 rows deleted for participant ID ${participantId}. Check that the Supabase 'Users can leave or hosts can remove/reject participants' RLS policy is applied.`;
    console.error(`[rejectParticipant] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const deletedParticipant = data[0];

  // Remove from group_members if present
  try {
    const { data: group } = await supabase
      .from("group_conversations")
      .select("id")
      .eq("outing_id", outingId)
      .maybeSingle();

    if (group?.id && deletedParticipant.user_id) {
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", group.id)
        .eq("user_id", deletedParticipant.user_id);
    }
  } catch (err) {
    console.error("[rejectParticipant] Group removal fallback error:", err);
  }

  console.log("[rejectParticipant] Success:", deletedParticipant);
  return deletedParticipant;
}

/* =========================
   REMOVE PARTICIPANT
========================= */

export async function removeParticipant(participantId: string, outingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  console.log("[removeParticipant] Initiating mutation:", {
    participantId,
    outingId,
    hostUserId: user.id,
  });

  const { data, error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId)
    .select();

  console.log("[removeParticipant] Supabase response:", { data, error });

  if (error) {
    console.error("[removeParticipant] Supabase error:", error);
    throw new Error(error.message || "Failed to remove participant in database");
  }

  if (!data || data.length === 0) {
    const errorMsg = `Database delete blocked: 0 rows deleted for participant ID ${participantId}.`;
    console.error(`[removeParticipant] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const removedParticipant = data[0];

  // Remove from group_members without touching previous messages
  try {
    const { data: group } = await supabase
      .from("group_conversations")
      .select("id")
      .eq("outing_id", outingId)
      .maybeSingle();

    if (group?.id && removedParticipant.user_id) {
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", group.id)
        .eq("user_id", removedParticipant.user_id);
    }
  } catch (err) {
    console.error("[removeParticipant] Group removal fallback error:", err);
  }

  console.log("[removeParticipant] Success:", removedParticipant);
  return removedParticipant;
}

