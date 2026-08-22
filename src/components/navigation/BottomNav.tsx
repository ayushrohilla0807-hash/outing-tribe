import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/features/profile/services/profileService";
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

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;

          if (item.center) {
            return (
              <Link key={item.to} to={item.to} className="group relative" aria-label={item.label}>
                <div className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-primary/25 transition-all duration-300 group-hover:scale-105 group-active:scale-95">
                  <Icon size={26} active={true} className="text-black" />
                </div>
              </Link>
            );
          }

          const isProfile = item.to === "/profile";
          const hasAvatar = isProfile && Boolean(profile?.avatarUrl);

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className="group flex items-center justify-center p-3 transition-all duration-200"
            >
              {hasAvatar ? (
                <div
                  className={`relative h-7 w-7 rounded-full overflow-hidden border transition-all duration-200 ${
                    active
                      ? "border-primary ring-2 ring-primary/40 scale-110"
                      : "border-white/20 opacity-80 group-hover:opacity-100 group-hover:border-white/50"
                  }`}
                >
                  <img
                    src={profile!.avatarUrl}
                    alt={profile?.name || "Profile"}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <Icon
                  size={24}
                  active={active}
                  className={`transition-all duration-200 ${
                    active
                      ? "text-primary scale-110"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
