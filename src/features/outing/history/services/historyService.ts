import { supabase } from "@/integrations/supabase/client";
import type { HistoryOuting, HistoryStatus } from "../models/history";

export async function getHistory(): Promise<HistoryOuting[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  console.log("[getHistory] Loading history for user:", user.id);

  const historyList: HistoryOuting[] = [];
  const seenIds = new Set<string>();

  // 1. Participated outings (pending or joined)
  const { data: participations, error: partError } = await supabase
    .from("participants")
    .select("id, status, outing_id, joined_at")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (partError) {
    console.error("[getHistory] Error fetching participations:", partError);
  }

  const participatedOutingIds = (participations ?? []).map((p) => p.outing_id);
  const participationStatusMap = new Map(
    (participations ?? []).map((p) => [p.outing_id, p.status]),
  );

  // Fetch outing records for participations
  let participatedOutings: any[] = [];
  if (participatedOutingIds.length > 0) {
    const { data: outingsData, error: outingsError } = await supabase
      .from("outings")
      .select("*")
      .in("id", participatedOutingIds);

    if (outingsError) {
      console.error("[getHistory] Error fetching participated outings:", outingsError);
    }
    participatedOutings = outingsData ?? [];
  }

  // 2. Hosted outings
  const { data: hostedOutings, error: hostError } = await supabase
    .from("outings")
    .select("*")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  if (hostError) {
    console.error("[getHistory] Error fetching hosted outings:", hostError);
  }

  const allOutings = [...participatedOutings, ...(hostedOutings ?? [])];
  const allOutingIds = Array.from(new Set(allOutings.map((o) => o.id)));

  // Batch fetch host profiles
  const allHostIds = Array.from(new Set(allOutings.map((o) => o.host_id).filter(Boolean)));
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

  // Batch fetch joined participant counts
  const countsMap = new Map<string, number>();
  if (allOutingIds.length > 0) {
    const { data: allParticipants } = await supabase
      .from("participants")
      .select("outing_id")
      .in("outing_id", allOutingIds)
      .eq("status", "joined");

    if (allParticipants) {
      for (const p of allParticipants) {
        countsMap.set(p.outing_id, (countsMap.get(p.outing_id) || 0) + 1);
      }
    }
  }

  // Build participated entries
  for (const outing of participatedOutings) {
    seenIds.add(outing.id);
    const pStatus = participationStatusMap.get(outing.id);

    let status: HistoryStatus = "pending";
    if (outing.status === "cancelled") status = "cancelled";
    else if (outing.status === "completed") status = "completed";
    else if (pStatus === "joined") status = "joined";
    else status = "pending";

    historyList.push({
      id: outing.id,
      title: outing.title,
      location: outing.location,
      date: `${outing.outing_date} • ${outing.start_time}`,
      host: profileMap.get(outing.host_id) || "Host",
      image:
        outing.cover_image ||
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&auto=format&fit=crop&q=80",
      status,
      participants: countsMap.get(outing.id) || 0,
    });
  }

  // Build hosted entries
  for (const outing of hostedOutings ?? []) {
    if (seenIds.has(outing.id)) continue;
    seenIds.add(outing.id);

    let status: HistoryStatus = "joined";
    if (outing.status === "cancelled") status = "cancelled";
    else if (outing.status === "completed") status = "completed";

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
      participants: countsMap.get(outing.id) || 0,
    });
  }

  console.log("[getHistory] Total history items returned:", historyList.length);
  return historyList;
}
