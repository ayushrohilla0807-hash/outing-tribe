import { MapPin, Star, Check, X, Trash2, Loader2 } from "lucide-react";
import type { Participant } from "../models/participant";

type ParticipantCardProps = {
  participant: Participant;
  loading?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onRemove?: (id: string) => void;
};

export default function ParticipantCard({
  participant,
  loading = false,
  onAccept,
  onReject,
  onRemove,
}: ParticipantCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5 shadow-sm transition-all hover:border-primary/30">
      <div className="flex items-start gap-4">
        <img
          src={
            participant.avatar?.trim()
              ? participant.avatar
              : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
          }
          alt={participant.name}
          className="h-14 w-14 rounded-full object-cover border border-white/10"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{participant.name}</h3>
            <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              <Star className="h-3 w-3 fill-current" /> {participant.rating || 5}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{participant.age ? `${participant.age} yrs` : "Age not specified"}</span>
            {participant.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {participant.city}
              </span>
            )}
            <span>
              •{" "}
              {participant.status === "pending"
                ? `Requested ${participant.joinedAt}`
                : `Joined ${participant.joinedAt}`}
            </span>
          </div>
        </div>
      </div>

      {participant.interests && participant.interests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {participant.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      {participant.status === "pending" ? (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => onAccept?.(participant.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{" "}
            Accept
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onReject?.(participant.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" /> Reject
          </button>
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => onRemove?.(participant.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}{" "}
            Remove from Outing
          </button>
        </div>
      )}
    </div>
  );
}
