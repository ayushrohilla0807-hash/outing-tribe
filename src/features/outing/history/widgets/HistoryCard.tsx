import type { HistoryOuting } from "../models/history";
import StatusBadge from "./StatusBadge";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

type Props = {
  outing: HistoryOuting;
};

export default function HistoryCard({ outing }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
      <img
        src={getOptimizedImageUrl(outing.image, "card")}
        alt={outing.title}
        className="h-44 w-full object-cover"
        loading="lazy"
        decoding="async"
      />

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold">{outing.title}</h3>

          <StatusBadge status={outing.status} />
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>📍 {outing.location}</p>
          <p>📅 {outing.date}</p>
          <p>👤 Hosted by {outing.host}</p>
          <p>👥 {outing.participants} Participants</p>
        </div>
      </div>
    </div>
  );
}
