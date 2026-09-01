import { supabase } from "@/integrations/supabase/client";
import { ensureOutingGroup } from "@/features/chats/services/groupChatService";

export async function fetchOutings() {
  const { data, error } = await supabase
    .from("outings")
    .select(
      `
      *,
      participants(count)
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function createOuting(payload: {
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  outing_date: string;
  start_time: string;
  end_time: string | null;
  max_participants: number;
  cover_image: string | null;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("outings")
    .insert({
      ...payload,
      host_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Initialize group chat for this outing with host as initial member
  if (data?.id) {
    try {
      await ensureOutingGroup(data.id, user.id);
    } catch (err) {
      console.error("Failed to initialize outing group chat:", err);
    }
  }

  return data;
}

