import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, PlusCircle, MessageCircle, User } from "lucide-react";

const items = [
  {
    label: "Home",
    to: "/home",
    icon: Home,
  },
  {
    label: "Explore",
    to: "/explore",
    icon: Compass,
  },
  {
    label: "Create",
    to: "/create",
    icon: PlusCircle,
    center: true,
  },
  {
    label: "Chats",
    to: "/chats",
    icon: MessageCircle,
  },
  {
    label: "Profile",
    to: "/profile",
    icon: User,
  },
];

export default function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-md items-center justify-around">

        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;

          if (item.center) {
            return (
              <Link key={item.to} to={item.to}>
                <div className="flex h-16 w-16 -translate-y-5 items-center justify-center rounded-full bg-primary text-white shadow-xl transition hover:scale-105">
                  <Icon size={30} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1"
            >
              <Icon
                size={24}
                className={
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              />

              <span
                className={`text-xs ${
                  active
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}