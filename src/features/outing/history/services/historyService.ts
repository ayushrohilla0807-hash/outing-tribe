import { supabase } from "@/integrations/supabase/client";
import type { HistoryOuting, HistoryStatus } from "../models/history";

export async function getHistory(): Promise<HistoryOuting[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const historyList: HistoryOuting[] = [];
  const seenIds = new Set<string>();

  // 1. Participated outings
  const { data: participations } = await supabase
    .from("participants")
    .select(
      `
      status,
      outing_id,
      outings (
        id,
        title,
        location,
        outing_date,
        start_time,
        cover_image,
        status,
        max_participants,
        host_id,
        profiles:host_id (
          full_name
        ),
        participants (
          id,
          status
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (participations) {
    for (const p of participations) {
      const outing = p.outings as any;
      if (!outing) continue;
      seenIds.add(outing.id);

      let status: HistoryStatus = "pending";
      if (outing.status === "cancelled") status = "cancelled";
      else if (outing.status === "completed") status = "completed";
      else if (p.status === "joined") status = "joined";
      else status = "pending";

      const joinedCount = ((outing.participants as any[]) || []).filter(
        (part) => part.status === "joined",
      ).length;

      historyList.push({
        id: outing.id,
        title: outing.title,
        location: outing.location,
        date: `${outing.outing_date} • ${outing.start_time}`,
        host: outing.profiles?.full_name || "Host",
        image:
          outing.cover_image ||
          "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&auto=format&fit=crop&q=80",
        status,
        participants: joinedCount,
      });
    }
  }

  // 2. Hosted outings
  const { data: hosted } = await supabase
    .from("outings")
    .select(
      `
      id,
      title,
      location,
      outing_date,
      start_time,
      cover_image,
      status,
      max_participants,
      profiles:host_id (
        full_name
      ),
      participants (
        id,
        status
      )
    `,
    )
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  if (hosted) {
    for (const outing of hosted) {
      if (seenIds.has(outing.id)) continue;
      seenIds.add(outing.id);

      let status: HistoryStatus = "joined";
      if (outing.status === "cancelled") status = "cancelled";
      else if (outing.status === "completed") status = "completed";

      const joinedCount = ((outing.participants as any[]) || []).filter(
        (part: any) => part.status === "joined",
      ).length;

      historyList.push({
        id: outing.id,
        title: outing.title,
        location: outing.location,
        date: `${outing.outing_date} • ${outing.start_time}`,
        host: "You (Host)",
        image:
          outing.cover_image ||
          "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&auto=format&fit=crop&q=80",
        status,
        participants: joinedCount,
      });
    }
  }

  return historyList;
}
