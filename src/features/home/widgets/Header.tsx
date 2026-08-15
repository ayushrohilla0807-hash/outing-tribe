import { Bell, MapPin } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

type HeaderProps = {
  userName: string;
  location: string;
};

export default function Header({ userName, location }: HeaderProps) {
  const navigate = useNavigate();
  const hour = new Date().getHours();

  let greeting = "Hello";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
          <MapPin size={15} />
          <span>{location}</span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          {greeting}, <span className="text-primary">{userName}</span> 👋
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">Ready for your next adventure?</p>
      </div>

      <button
        onClick={() => navigate({ to: "/notifications" })}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface border border-white/10 hover:border-primary/40 hover:bg-surface-elevated transition cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-foreground" />
      </button>
    </div>
  );
}
