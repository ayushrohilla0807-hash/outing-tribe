import { supabase } from "@/integrations/supabase/client";

export interface OutingDetailData {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  outing_date: string;
  start_time: string;
  end_time: string | null;
  max_participants: number;
  price: number | null;
  rules: string | null;
  cover_image: string | null;
  status: string;
  interests: string[] | null;
  created_at: string | null;
  host: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
  };
  joinedParticipants: Array<{
    id: string;
    userId: string;
    name: string;
    avatar: string | null;
  }>;
  joinedCount: number;
  pendingCount: number;
}

export async function getOutingById(id: string): Promise<OutingDetailData> {
  const { data: outing, error } = await supabase.from("outings").select("*").eq("id", id).single();

  if (error) throw error;
  if (!outing) throw new Error("Outing not found");

  // Fetch host profile
  const { data: hostProfile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, city")
    .eq("id", outing.host_id)
    .maybeSingle();

  // Fetch participants for this outing
  const { data: participants } = await supabase
    .from("participants")
    .select("id, user_id, status")
    .eq("outing_id", id);

  const joinedList = participants?.filter((p) => p.status === "joined") ?? [];
  const pendingList = participants?.filter((p) => p.status === "pending") ?? [];

  let joinedParticipantsWithProfiles: Array<{
    id: string;
    userId: string;
    name: string;
    avatar: string | null;
  }> = [];

  if (joinedList.length > 0) {
    const userIds = joinedList.map((p) => p.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map((profiles ?? []).map((pr) => [pr.id, pr]));

    joinedParticipantsWithProfiles = joinedList.map((p) => {
      const pr = profileMap.get(p.user_id);
      return {
        id: p.id,
        userId: p.user_id,
        name: pr?.full_name ?? "Member",
        avatar: pr?.avatar_url ?? null,
      };
    });
  }

  return {
    ...outing,
    host: {
      id: outing.host_id,
      full_name: hostProfile?.full_name ?? "Host",
      avatar_url: hostProfile?.avatar_url ?? null,
      bio: hostProfile?.bio ?? null,
      city: hostProfile?.city ?? null,
    },
    joinedParticipants: joinedParticipantsWithProfiles,
    joinedCount: joinedList.length,
    pendingCount: pendingList.length,
  };
}
