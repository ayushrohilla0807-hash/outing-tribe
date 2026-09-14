import { Calendar, CheckCircle, Edit, MapPin, Trash2, Users, Clock } from "lucide-react";

import type { HostedOuting } from "../models/hostedOuting";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

type HostedOutingCardProps = {
  outing: HostedOuting;

  onParticipants?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const STATUS_STYLE = {
  upcoming: "bg-success/20 text-success dark:bg-success/30 dark:text-success-foreground",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  cancelled:
    "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive-foreground",
};

export default function HostedOutingCard({
  outing,
  onParticipants,
  onEdit,
  onCancel,
  onComplete,
  onDelete,
}: HostedOutingCardProps) {
  const isUpcoming = outing.status === "upcoming";
  const isCancelled = outing.status === "cancelled";
  const isCompleted = outing.status === "completed";

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-card shadow-sm transition-all hover:shadow-lg">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            outing.image
              ? getOptimizedImageUrl(outing.image, "card")
              : "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80"
          }
          alt={outing.title}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />

        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          {outing.category}
        </span>

        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLE[outing.status]}`}
        >
          {outing.status.charAt(0).toUpperCase() + outing.status.slice(1)}
        </span>

        {/* Pending badge */}
        {outing.pending > 0 && isUpcoming && (
          <span className="absolute left-3 bottom-3 rounded-full bg-pending px-2.5 py-1 text-[10px] font-semibold text-pending-foreground shadow">
            {outing.pending} pending
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        <h2 className="text-lg font-bold leading-snug line-clamp-1">{outing.title}</h2>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin size={13} />
            <span className="truncate">{outing.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={13} />
            <span>{outing.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={13} />
            <span>{outing.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={13} />
            <span>
              {outing.joined} / {outing.capacity} joined
            </span>
          </div>
        </div>

        {/* Participants */}
        <button
          onClick={() => onParticipants?.(outing.id)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold transition hover:bg-primary/10 hover:border-primary/30"
        >
          View Participants
          {outing.pending > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
              {outing.pending}
            </span>
          )}
        </button>

        {/* Actions */}
        <div
          className={`grid gap-2 ${isUpcoming ? "grid-cols-3" : isCancelled ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {isUpcoming && (
            <button
              onClick={() => onEdit?.(outing.id)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Edit size={13} />
              Edit
            </button>
          )}

          {!isCancelled && !isCompleted && (
            <>
              <button
                onClick={() => onCancel?.(outing.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive py-2.5 text-xs font-semibold text-destructive-foreground transition hover:opacity-90"
              >
                <Trash2 size={13} />
                Cancel
              </button>

              {isUpcoming && (
                <button
                  onClick={() => onComplete?.(outing.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-xs font-semibold text-success-foreground transition hover:opacity-90"
                >
                  <CheckCircle size={13} />
                  Complete
                </button>
              )}
            </>
          )}

          {isCancelled && (
            <>
              <button
                onClick={() => onEdit?.(outing.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-xs font-medium transition hover:bg-white/5"
              >
                <Edit size={13} />
                View Details
              </button>
              <button
                onClick={() => onDelete?.(outing.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/15 text-destructive border border-destructive/30 py-2.5 text-xs font-semibold hover:bg-destructive/25 transition"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </>
          )}

          {isCompleted && (
            <button
              onClick={() => onEdit?.(outing.id)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-xs font-medium transition hover:bg-white/5"
            >
              <Edit size={13} />
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
