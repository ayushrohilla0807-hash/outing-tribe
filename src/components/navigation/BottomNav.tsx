import { Link, useRouterState } from "@tanstack/react-router";
import { HomeIcon, ExploreIcon, CreateIcon, ChatsIcon, ProfileIcon } from "./NavIcons";

const items = [
  {
    label: "Home",
    to: "/home",
    icon: HomeIcon,
  },
  {
    label: "Explore",
    to: "/explore",
    icon: ExploreIcon,
  },
  {
    label: "Create",
    to: "/create",
    icon: CreateIcon,
    center: true,
  },
  {
    label: "Chats",
    to: "/chats",
    icon: ChatsIcon,
  },
  {
    label: "Profile",
    to: "/profile",
    icon: ProfileIcon,
  },
];

export default function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // Hide completely on individual chat conversation screens
  if (/^\/chats\/[^/]+\/[^/]+/.test(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] transition-all">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.to || (item.to !== "/home" && pathname.startsWith(item.to));

          if (item.center) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group relative flex items-center justify-center -translate-y-3"
                aria-label={item.label}
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-primary/30 transition-all duration-200 group-hover:scale-105 group-active:scale-95">
                  <Icon size={24} active={true} className="text-black stroke-[2.5]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className="group flex min-h-[48px] min-w-[48px] items-center justify-center p-2.5 transition-all duration-200"
            >
              <div className="flex flex-col items-center gap-1">
                <Icon
                  size={22}
                  active={active}
                  className={`transition-all duration-200 ${
                    active
                      ? "text-primary scale-110"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
