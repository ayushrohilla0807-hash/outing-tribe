import { fetchOutings, createOuting as createOutingApi } from "../api/outingApi";

import type { Outing } from "../models/outing";

export async function getOutings(): Promise<Outing[]> {
  const data = await fetchOutings();

  return (
    data?.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      coverImage: item.cover_image ?? "",
      location: item.location,
      city: item.city,
      outingDate: item.outing_date,
      startTime: item.start_time,
      endTime: item.end_time,
      participantCount: item.participants?.[0]?.count ?? 0,
      maxParticipants: item.max_participants,
      hostId: item.host_id,
      hostName: "Host",
      hostAvatar: "",
      rating: 5,
      joined: false,
    })) ?? []
  );
}

export async function createOuting(payload: Parameters<typeof createOutingApi>[0]) {
  return createOutingApi(payload);
}
