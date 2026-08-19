import { useNavigate } from "@tanstack/react-router";
import OutingCard from "@/components/cards/OutingCard";
import { useSaved } from "../context/SavedContext";
import type { SavedOuting } from "../models/savedOuting";

type Props = {
  outing: SavedOuting;
};

export default function SavedOutingCard({ outing }: Props) {
  const navigate = useNavigate();
  const { toggleSaved } = useSaved();

  return (
    <OutingCard
      id={outing.id}
      image={outing.image}
      title={outing.title}
      category={outing.category}
      location={outing.location}
      date={outing.date}
      saved={true}
      onCardClick={() =>
        navigate({
          to: "/outing/$id",
          params: {
            id: outing.id,
          },
        })
      }
      onSave={() => toggleSaved(outing)}
    />
  );
}
