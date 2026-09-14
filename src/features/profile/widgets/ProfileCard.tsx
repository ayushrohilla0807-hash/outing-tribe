import { MapPin, Star, LayoutDashboard, UserCheck, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";
import type { UserProfile } from "../models/profile";

type Props = {
  profile: UserProfile;
  isOwnProfile?: boolean;
  savedCount: number;
  onEditClick?: () => void;
  onShareClick: () => void;
  onHostDashboardClick?: () => void;
  onTabChange?: (tab: "hosted" | "joined" | "saved") => void;
};

export default function ProfileCard({
  profile,
  isOwnProfile = true,
  savedCount,
  onEditClick,
  onShareClick,
  onHostDashboardClick,
  onTabChange,
}: Props) {
  const initials = (profile.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">
      {/* Instagram-style Avatar + Stats Header Row */}
      <div className="flex items-center justify-between gap-4 sm:gap-6 pt-1">
        {/* Story Gradient Ring Avatar */}
        <div className="relative shrink-0">
          <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-primary shadow-sm hover:scale-105 transition-transform duration-200 cursor-pointer">
            <div className="p-0.5 rounded-full bg-background">
              <Avatar className="h-20 w-20 sm:h-22 sm:w-22 rounded-full border border-black/20">
                <AvatarImage
                  src={
                    profile.avatarUrl ? getOptimizedImageUrl(profile.avatarUrl, "card") : undefined
                  }
                  alt={profile.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/20 text-xl font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-1 items-center justify-around text-center select-none">
          <button
            type="button"
            onClick={() => onTabChange?.("hosted")}
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition"
          >
            <span className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition">
              {profile.hostedCount}
            </span>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition">
              Hosted
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange?.("joined")}
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition"
          >
            <span className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition">
              {profile.joinedCount}
            </span>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition">
              Joined
            </span>
          </button>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => onTabChange?.("saved")}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition"
            >
              <span className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition">
                {savedCount}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition">
                Saved
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Bio & Details Section */}
      <div className="space-y-1.5 text-left pt-1">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
            {profile.name}
          </h2>
          {profile.age > 0 && (
            <span className="text-xs text-muted-foreground font-medium">• {profile.age}</span>
          )}
        </div>

        {/* Subtitle / Category badge */}
        <p className="text-xs font-semibold text-primary flex items-center gap-1">
          <Sparkles className="h-3 w-3 inline" /> Outing Host & Community Member
        </p>

        {/* Bio Text */}
        {profile.bio ? (
          <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
            {profile.bio}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground italic">
            Connecting people through memorable outings & adventures ✨
          </p>
        )}

        {/* Location & Host Rating Pill Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {profile.city && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary" />
              {profile.city}
              {profile.state ? `, ${profile.state}` : ""}
            </span>
          )}

          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {profile.hostRating} Host Rating
          </span>
        </div>
      </div>

      {/* Instagram-style Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {isOwnProfile ? (
          <>
            {onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 px-3 text-xs sm:text-sm font-semibold text-foreground hover:bg-white/10 active:scale-[0.98] transition cursor-pointer text-center"
              >
                Edit Profile
              </button>
            )}

            <button
              type="button"
              onClick={onShareClick}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 px-3 text-xs sm:text-sm font-semibold text-foreground hover:bg-white/10 active:scale-[0.98] transition cursor-pointer text-center"
            >
              Share Profile
            </button>

            {onHostDashboardClick && (
              <button
                type="button"
                onClick={onHostDashboardClick}
                aria-label="Host Dashboard"
                title="Host Dashboard"
                className="flex h-9 w-9 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-foreground hover:bg-white/10 active:scale-95 transition cursor-pointer shrink-0"
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onShareClick}
            className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 px-4 text-xs sm:text-sm font-semibold text-foreground hover:bg-white/15 active:scale-[0.98] transition cursor-pointer text-center shadow-sm"
          >
            Share Profile
          </button>
        )}
      </div>
    </div>
  );
}
