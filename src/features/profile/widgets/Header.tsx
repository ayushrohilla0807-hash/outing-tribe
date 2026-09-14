import { Settings, PlusSquare, Share2, BadgeCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { UserProfile } from "../models/profile";

type ProfileHeaderProps = {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onSettingsClick?: () => void;
  onShareClick: () => void;
  onBack?: () => void;
};

export default function ProfileHeader({
  profile,
  isOwnProfile = true,
  onSettingsClick,
  onShareClick,
  onBack,
}: ProfileHeaderProps) {
  const navigate = useNavigate();

  // Create a clean Instagram-like username handle from name
  const username =
    profile.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "user";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/explore" });
    }
  };

  return (
    <header className="mb-4 flex items-center justify-between">
      {/* Instagram-style username with verified badge & back button if public profile */}
      <div className="flex items-center gap-2 min-w-0">
        {!isOwnProfile && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            title="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-white/10 active:scale-95 transition cursor-pointer shrink-0 mr-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
          {username}
        </h1>
        {profile.verified && (
          <BadgeCheck className="h-5 w-5 text-primary shrink-0 fill-primary/10" />
        )}
      </div>

      {/* Top right action buttons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => navigate({ to: "/create" })}
            aria-label="Create Outing"
            title="Create Outing"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <PlusSquare className="h-5 w-5" />
          </button>
        )}

        <button
          type="button"
          onClick={onShareClick}
          aria-label="Share Profile"
          title="Share Profile"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-white/10 active:scale-95 transition cursor-pointer"
        >
          <Share2 className="h-5 w-5" />
        </button>

        {isOwnProfile && onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            aria-label="Settings"
            title="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
