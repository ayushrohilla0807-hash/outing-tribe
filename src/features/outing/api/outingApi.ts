import { supabase } from "@/integrations/supabase/client";
import { ensureOutingGroup } from "@/features/chats/services/groupChatService";
import { isOutingActive } from "@/lib/outingDate";

export async function fetchOutings() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yYear = yesterday.getFullYear();
  const yMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
  const yDay = String(yesterday.getDate()).padStart(2, "0");
  const yesterdayIsoStr = `${yYear}-${yMonth}-${yDay}`;

  const { data, error } = await supabase
    .from("outings")
    .select(
      `
      *,
      participants(count)
    `,
    )
    .neq("status", "cancelled")
    .neq("status", "completed")
    .gte("outing_date", yesterdayIsoStr)
    .order("outing_date", {
      ascending: true,
    })
    .order("start_time", {
      ascending: true,
    });

  if (error) throw error;

  return data?.filter((item) => isOutingActive(item, now)) ?? [];
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
