import { Bell, MapPin } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

type HeaderProps = {
  userName?: string;
  location: string;
};

export default function Header({ location }: HeaderProps) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-primary text-xs font-medium truncate">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl text-foreground break-words leading-tight">
          Never <span className="text-primary">Cancel Plans</span> Again
        </h1>
      </div>

      <button
        onClick={() => navigate({ to: "/notifications" })}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface border border-white/10 hover:border-primary/40 hover:bg-surface-elevated active:scale-95 transition cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
        )}
      </button>
    </div>
  );
}
