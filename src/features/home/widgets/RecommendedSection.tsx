import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import OutingCard from "@/components/cards/OutingCard";
import { useSaved } from "@/features/outing/saved/context/SavedContext";
import { getExploreOutings } from "@/features/explore/services/exploreService";
import type { ExploreOuting } from "@/features/explore/models/outing";
import { isOutingActive } from "@/lib/outingDate";

export default function RecommendedSection() {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const { data: rawOutings = [], isLoading } = useQuery({
    queryKey: ["explore-outings"],
    queryFn: getExploreOutings,
    refetchInterval: 30000,
  });

  const outings = useMemo(() => {
    return rawOutings.filter((o) => isOutingActive(o, now));
  }, [rawOutings, now]);

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          <div className="h-56 w-full bg-white/5 rounded-3xl animate-pulse" />
          <div className="h-56 w-full bg-white/5 rounded-3xl animate-pulse" />
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
  const { isSaved, toggleSaved } = useSaved();

  return (
    <OutingCard
      id={outing.id}
      image={outing.image}
      title={outing.title}
      category={outing.category}
      location={outing.city ? `${outing.location}, ${outing.city}` : outing.location}
      date={outing.date}
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
    />
  );
}
