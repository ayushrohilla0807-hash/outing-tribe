import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import OutingCard from "@/components/cards/OutingCard";
import { useSaved } from "@/features/outing/saved/context/SavedContext";

import {
  getJoinStatus,
  joinOuting,
  type JoinStatus,
} from "@/features/outing/join/services/participantService";

import { getExploreOutings } from "@/features/explore/services/exploreService";
import type { ExploreOuting } from "@/features/explore/models/outing";

export default function RecommendedSection() {
  const navigate = useNavigate();
  const { data: outings = [], isLoading } = useQuery({
    queryKey: ["explore-outings"],
    queryFn: getExploreOutings,
  });

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          <div className="h-48 w-full bg-white/5 rounded-3xl animate-pulse" />
          <div className="h-48 w-full bg-white/5 rounded-3xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (outings.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">⭐ Recommended Outings</h2>

        <button
          onClick={() => navigate({ to: "/explore" })}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          See all ({outings.length})
        </button>
      </div>

      <div className="space-y-6">
        {outings.slice(0, 5).map((outing) => (
          <RecommendedCard key={outing.id} outing={outing} />
        ))}
      </div>
    </section>
  );
}

function RecommendedCard({ outing }: { outing: ExploreOuting }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSaved, toggleSaved } = useSaved();
  const [loading, setLoading] = useState(false);

  const { data: status = "none", isLoading: statusLoading } = useQuery<JoinStatus>({
    queryKey: ["join-status", outing.id],
    queryFn: () => getJoinStatus(outing.id),
    staleTime: 1000 * 30,
  });

  async function handleJoin() {
    if (loading || status !== "none") return;

    try {
      setLoading(true);
      await joinOuting(outing.id);
      toast.success(`Join request sent for "${outing.title}"!`);

      await queryClient.invalidateQueries({
        queryKey: ["join-status", outing.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["explore-outings"],
      });

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
    <OutingCard
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
