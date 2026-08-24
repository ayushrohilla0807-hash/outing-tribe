import { Users, CheckCircle2, Compass, Bell, ChevronRight } from "lucide-react";
import type { Notification } from "../models/notification";

interface Props {
  notification: Notification;
  onClick?: () => void;
}

export default function NotificationCard({ notification, onClick }: Props) {
  const getIcon = () => {
    switch (notification.type) {
      case "join_request":
        return <Users className="h-5 w-5 text-primary" />;
      case "accepted":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "outing_created":
        return <Compass className="h-5 w-5 text-sky-400" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${
        notification.read
          ? "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
          : "border-primary/40 bg-white/[0.08] shadow-sm hover:border-primary/60 hover:bg-white/[0.12]"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
          notification.read
            ? "border-white/10 bg-white/5"
            : "border-primary/30 bg-primary/10 shadow-sm"
        }`}
      >
        {getIcon()}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`text-sm font-semibold truncate ${
              notification.read ? "text-foreground/90" : "text-foreground font-bold"
            }`}
          >
            {notification.title}
          </h3>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">{notification.time}</span>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/30 animate-pulse" />
            )}
          </div>
        </div>

        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {notification.description}
        </p>

        {notification.link && (
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
            <span>View Details</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}
