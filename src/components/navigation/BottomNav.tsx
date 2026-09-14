import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HomeIcon, ExploreIcon, CreateIcon, ChatsIcon, ProfileIcon } from "./NavIcons";
import { useUnreadChatCount } from "@/features/chats/hooks/useUnreadChatCount";
import { getProfile } from "@/features/profile/services/profileService";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

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

function ProfileNavAvatar({
  avatarUrl,
  name,
  active,
  fallbackIcon: FallbackIcon,
}: {
  avatarUrl?: string;
  name?: string;
  active: boolean;
  fallbackIcon: React.ComponentType<{ size?: number; active?: boolean; className?: string }>;
}) {
  const [error, setError] = useState(false);

  if (!avatarUrl || error) {
    return (
      <FallbackIcon
        size={22}
        active={active}
        className={`transition-all duration-200 ${
          active ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
        }`}
      />
    );
  }

  const optimizedSrc = getOptimizedImageUrl(avatarUrl, "thumb");

  return (
    <div className="relative flex items-center justify-center">
      <img
        src={optimizedSrc}
        alt={name || "Profile"}
        onError={() => setError(true)}
        decoding="async"
        className={`h-[30px] w-[30px] rounded-full object-cover border-2 transition-all duration-200 ${
          active
            ? "border-primary scale-110 shadow-sm shadow-primary/30"
            : "border-white/20 group-hover:border-white/50"
        }`}
      />
    </div>
  );
}

export default function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const { unreadChatCount } = useUnreadChatCount();

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getProfile,
    staleTime: 1000 * 60,
  });

  // Hide completely on individual chat conversation screens (group and direct)
  if (pathname.startsWith("/chats/") && pathname !== "/chats") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] transition-all">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.to || (item.to !== "/home" && pathname.startsWith(item.to));
          const isChats = item.to === "/chats";
          const isProfile = item.to === "/profile";

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
              className="group relative flex min-h-[48px] min-w-[48px] items-center justify-center p-2.5 transition-all duration-200"
            >
              {isProfile ? (
                <ProfileNavAvatar
                  avatarUrl={profile?.avatarUrl}
                  name={profile?.name}
                  active={active}
                  fallbackIcon={Icon}
                />
              ) : (
                <div className="relative flex flex-col items-center gap-1">
                  <Icon
                    size={22}
                    active={active}
                    className={`transition-all duration-200 ${
                      active
                        ? "text-primary scale-110"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  {isChats && unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
