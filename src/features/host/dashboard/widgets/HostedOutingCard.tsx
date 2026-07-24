import {
    Calendar,
    CheckCircle,
    Edit,
    MapPin,
    Trash2,
    Users,
  } from "lucide-react";
  
  import type { HostedOuting } from "../models/hostedOuting";
  
  type HostedOutingCardProps = {
    outing: HostedOuting;
  
    onParticipants?: (id: string) => void;
    onEdit?: (id: string) => void;
    onCancel?: (id: string) => void;
    onComplete?: (id: string) => void;
  };
  
  export default function HostedOutingCard({
    outing,
    onParticipants,
    onEdit,
    onCancel,
    onComplete,
  }: HostedOutingCardProps) {
    return (
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:shadow-lg">
        {/* Image */}
        <div className="relative h-52">
          <img
            src={outing.image}
            alt={outing.title}
            className="h-full w-full object-cover"
          />
  
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            {outing.category}
          </span>
  
          <span
            className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
              outing.status === "upcoming"
                ? "bg-green-100 text-green-700"
                : outing.status === "completed"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {outing.status.charAt(0).toUpperCase() + outing.status.slice(1)}
          </span>
        </div>
  
        {/* Content */}
        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-bold">{outing.title}</h2>
          </div>
  
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {outing.location}
            </div>
  
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {outing.date} • {outing.time}
            </div>
  
            <div className="flex items-center gap-2">
              <Users size={16} />
              {outing.joined} / {outing.capacity} Joined
            </div>
          </div>
  
          {/* Participants */}
          <button
            onClick={() => onParticipants?.(outing.id)}
            className="w-full rounded-xl border py-3 font-medium transition hover:bg-muted"
          >
            View Participants
          </button>
  
          {/* Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onEdit?.(outing.id)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground transition hover:opacity-90"
            >
              <Edit size={16} />
              Edit
            </button>
  
            <button
              onClick={() => onCancel?.(outing.id)}
              className="flex items-center justify-center gap-2 rounded-xl bg-destructive py-3 text-destructive-foreground transition hover:opacity-90"
            >
              <Trash2 size={16} />
              Cancel
            </button>
  
            {outing.status === "upcoming" && (
              <button
                onClick={() => onComplete?.(outing.id)}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-white transition hover:bg-green-700"
              >
                <CheckCircle size={16} />
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }