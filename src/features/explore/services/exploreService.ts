import { supabase } from "@/integrations/supabase/client";
import { isOutingActive } from "@/lib/outingDate";
import type { ExploreOuting } from "../models/outing";

export async function getExploreOutings(): Promise<ExploreOuting[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Find outing IDs where current user is pending or joined
  const excludedOutingIds = new Set<string>();
  if (user) {
    const { data: userParticipations } = await supabase
      .from("participants")
      .select("outing_id")
      .eq("user_id", user.id)
      .in("status", ["pending", "joined"]);

    if (userParticipations) {
      userParticipations.forEach((p) => excludedOutingIds.add(p.outing_id));
    }
  }

  // Database-level query: Exclude outings older than yesterday (allowing for overnight outings ending today)
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yYear = yesterday.getFullYear();
  const yMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
  const yDay = String(yesterday.getDate()).padStart(2, "0");
  const yesterdayIsoStr = `${yYear}-${yMonth}-${yDay}`;

  let query = supabase
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
    .neq("status", "cancelled")
    .neq("status", "completed")
    .gte("outing_date", yesterdayIsoStr)
    .order("outing_date", { ascending: true })
    .order("start_time", { ascending: true });

  // Exclude outings created by the current user at the data-query level
  if (user) {
    query = query.neq("host_id", user.id);
  }

  const { data: outings, error } = await query;

  if (error) {
    console.error("Error fetching explore outings:", error);
    throw error;
  }

  if (!outings || outings.length === 0) return [];

  // Exclude outings where current user is host/pending/joined, and strictly filter out any outings whose end time has passed
  const visibleOutings = outings.filter(
    (item) =>
      (!user || item.host_id !== user.id) &&
      !excludedOutingIds.has(item.id) &&
      isOutingActive(item, now),
  );

  if (visibleOutings.length === 0) return [];

  // Fetch host profiles for these outings
  const hostIds = Array.from(new Set(visibleOutings.map((o) => o.host_id).filter(Boolean)));

  let profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
  if (hostIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", hostIds);

    if (profiles) {
      profileMap = new Map(profiles.map((p) => [p.id, p]));
    }
  }

  return visibleOutings.map((item: any): ExploreOuting => {
    const hostProfile = profileMap.get(item.host_id);
    const participantsList = (item.participants as any[]) || [];
    const joinedCount = participantsList.filter((p) => p.status === "joined").length;

    return {
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      image:
        item.cover_image ||
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80",
      location: item.location,
      city: item.city ?? "",
      hostId: item.host_id,
      host: hostProfile?.full_name || "Host",
      avatar: hostProfile?.avatar_url || undefined,
      rating: 5,
      date: `${item.outing_date} • ${item.start_time}`,
      outingDate: item.outing_date,
      startTime: item.start_time,
      endTime: item.end_time,
      participants: joinedCount,
      maxParticipants: item.max_participants,
      joined: false,
    };
  });
}
