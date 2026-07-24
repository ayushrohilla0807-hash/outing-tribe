import type { Participant } from "../models/participant";

type ParticipantCardProps = {
  participant: Participant;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onChat?: (id: string) => void;
  onRemove?: (id: string) => void;
};

export default function ParticipantCard({
  participant,
  onAccept,
  onReject,
  onChat,
  onRemove,
}: ParticipantCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <img
          src={participant.avatar}
          alt={participant.name}
          className="h-16 w-16 rounded-full object-cover"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {participant.name}
          </h3>

          <p className="text-sm text-muted-foreground">
            {participant.age} yrs • {participant.city}
          </p>

          <p className="mt-1 text-sm">
            ⭐ {participant.rating}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {participant.interests.map((interest) => (
          <span
            key={interest}
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            {interest}
          </span>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Joined {participant.joinedAt}
      </p>

      {participant.status === "pending" ? (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onAccept?.(participant.id)}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Accept
          </button>

          <button
            onClick={() => onReject?.(participant.id)}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onChat?.(participant.id)}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Chat
          </button>

          <button
            onClick={() => onRemove?.(participant.id)}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}