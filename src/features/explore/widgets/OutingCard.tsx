import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Card from "@/components/cards/OutingCard";

import { useSaved } from "@/features/outing/saved/context/SavedContext";

import {
  getJoinStatus,
  joinOuting,
  type JoinStatus,
} from "@/features/outing/join/services/participantService";

import type { ExploreOuting } from "../models/outing";

type Props = {
  outing: ExploreOuting;
};

export default function OutingCard({ outing }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isSaved, toggleSaved } = useSaved();
  const [loading, setLoading] = useState(false);

  const { data: status = "none", isLoading: statusLoading } = useQuery<JoinStatus>({
    queryKey: ["join-status", outing.id],
    queryFn: () => getJoinStatus(outing.id),
    staleTime: 1000 * 30, // 30 seconds
  });

  async function handleJoin() {
    if (loading || status !== "none") return;

    try {
      setLoading(true);
      await joinOuting(outing.id);
      toast.success(`Join request sent for "${outing.title}"!`);

      // Invalidate specifically this outing's join status
      await queryClient.invalidateQueries({
        queryKey: ["join-status", outing.id],
      });

      // Keep Explore & Recommended lists in sync
      await queryClient.invalidateQueries({
        queryKey: ["explore-outings"],
      });

      // Keep History in sync
      await queryClient.invalidateQueries({
        queryKey: ["history-outings"],
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send join request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      id={outing.id}
      image={outing.image}
      title={outing.title}
      category={outing.category}
      location={outing.location}
      date={outing.date}
      host={outing.host}
      hostAvatar={outing.avatar}
      rating={outing.rating}
      joinedCount={outing.participants}
      capacity={outing.maxParticipants}
      status={status}
      loading={loading || statusLoading}
      saved={isSaved(outing.id)}
      onCardClick={() =>
        navigate({
          to: "/outing/$id",
          params: {
            id: outing.id,
          },
        })
      }
      onSave={() =>
        toggleSaved({
          id: outing.id,
          title: outing.title,
          image: outing.image,
          category: outing.category,
          location: outing.location,
          date: outing.date,
          host: outing.host,
          hostAvatar: outing.avatar,
          rating: outing.rating,
          joined: outing.participants,
          capacity: outing.maxParticipants,
        })
      }
      onJoin={handleJoin}
    />
  );
}
