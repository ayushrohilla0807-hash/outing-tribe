import { supabase } from "@/integrations/supabase/client";

export type JoinStatus = "none" | "pending" | "joined";

export async function joinOuting(outingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: existing, error: existingError } = await supabase
    .from("participants")
    .select("id,status")
    .eq("outing_id", outingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  // Already requested or already joined
  if (existing) {
    return;
  }

  const { error } = await supabase.from("participants").insert({
    outing_id: outingId,
    user_id: user.id,
    status: "pending",
  });

  if (error) {
    throw error;
  }
}

export async function leaveOuting(outingId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("outing_id", outingId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  // Remove from group_members if present
  try {
    const { data: group } = await supabase
      .from("group_conversations")
      .select("id")
      .eq("outing_id", outingId)
      .maybeSingle();

    if (group?.id) {
      await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", user.id);
    }
  } catch (err) {
    console.error("[leaveOuting] Group member cleanup error:", err);
  }
}

export async function getJoinStatus(outingId: string): Promise<JoinStatus> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "none";
  }

  const { data, error } = await supabase
    .from("participants")
    .select("status")
    .eq("outing_id", outingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return "none";
  }

  return data.status as JoinStatus;
}

export async function isJoined(outingId: string): Promise<boolean> {
  const status = await getJoinStatus(outingId);
  return status === "joined";
}
