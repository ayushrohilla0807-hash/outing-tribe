import { useNavigate } from "@tanstack/react-router";
import Card from "@/components/cards/OutingCard";
import { useSaved } from "@/features/outing/saved/context/SavedContext";
import type { ExploreOuting } from "../models/outing";

type Props = {
  outing: ExploreOuting;
};

export default function OutingCard({ outing }: Props) {
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useSaved();

  return (
    <Card
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
