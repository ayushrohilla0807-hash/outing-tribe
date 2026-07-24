import SaveButton from "./SaveButton";

import { useSaved } from "../context/SavedContext";
import type { SavedOuting } from "../models/savedOuting";

type Props = {
  outing: SavedOuting;
};

export default function SavedOutingCard({
  outing,
}: Props) {
  const { toggleSaved } = useSaved();

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:-translate-y-1">

      <div className="relative">
        <img
          src={outing.image}
          alt={outing.title}
          className="h-56 w-full object-cover"
        />

        <SaveButton
          saved
          onClick={() => toggleSaved(outing)}
        />
      </div>

      <div className="space-y-4 p-5">

        <div className="flex items-center justify-between">

          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {outing.category}
          </span>

          <span className="text-sm font-medium">
            ⭐ {outing.rating}
          </span>

        </div>

        <h2 className="text-xl font-bold">
          {outing.title}
        </h2>

        <div className="space-y-2 text-sm text-muted-foreground">

          <p>📍 {outing.location}</p>

          <p>📅 {outing.date}</p>

          <p>👤 {outing.host}</p>

          <p>
            👥 {outing.joined}/{outing.capacity} Joined
          </p>

        </div>

      </div>

    </div>
  );
}