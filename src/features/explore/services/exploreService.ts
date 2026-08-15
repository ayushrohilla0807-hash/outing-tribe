import { supabase } from "@/integrations/supabase/client";
import type { ExploreOuting } from "../models/outing";

export async function getExploreOutings(): Promise<ExploreOuting[]> {
  const { data: outings, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching explore outings:", error);
    throw error;
  }

  if (!outings || outings.length === 0) return [];

  // Fetch host profiles for these outings
  const hostIds = Array.from(new Set(outings.map((o) => o.host_id).filter(Boolean)));

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

  return outings.map((item: any): ExploreOuting => {
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
