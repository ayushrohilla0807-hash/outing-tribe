import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { useTheme } from "@/hooks/use-theme";
import { useSaved } from "@/features/outing/saved/context/SavedContext";
import { getHostedOutings } from "@/features/host/dashboard/services/hostDashboardService";
import { getHistory } from "@/features/outing/history/services/historyService";
import type { HostedOuting } from "@/features/host/dashboard/models/hostedOuting";
import type { HistoryOuting } from "@/features/outing/history/models/history";

import type { UserProfile } from "./models/profile";
import {
  getProfile,
  getPublicProfile,
  getUserHostedOutings,
  getUserJoinedOutings,
  updateProfile,
} from "./services/profileService";

import Header from "./widgets/Header";
import ProfileCard from "./widgets/ProfileCard";
import Interests from "./widgets/Interests";
import ProfileGrid from "./widgets/ProfileGrid";
import SettingsDrawer from "./widgets/SettingsDrawer";
import EditProfileModal from "./widgets/EditProfileModal";

type ProfileScreenProps = {
  targetUserId?: string;
};

export default function ProfileScreen({ targetUserId }: ProfileScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();
  const { savedOutings } = useSaved();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hostedOutings, setHostedOutings] = useState<HostedOuting[]>([]);
  const [joinedOutings, setJoinedOutings] = useState<HistoryOuting[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"hosted" | "joined" | "saved">("hosted");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = !targetUserId || (currentUserId !== null && targetUserId === currentUserId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const effectiveUserId = authUser?.id;
      if (effectiveUserId) {
        setCurrentUserId(effectiveUserId);
      }

      const viewingSelf = !targetUserId || (effectiveUserId && targetUserId === effectiveUserId);

      if (viewingSelf) {
        const [profileData, hostedData, historyData] = await Promise.all([
          getProfile(),
          getHostedOutings().catch(() => []),
          getHistory().catch(() => []),
        ]);

        setProfile(profileData);
        setHostedOutings(hostedData);
        setJoinedOutings(historyData);
      } else {
        // Public profile viewing for another user
        const [profileData, hostedData, historyData] = await Promise.all([
          getPublicProfile(targetUserId),
          getUserHostedOutings(targetUserId).catch(() => []),
          getUserJoinedOutings(targetUserId).catch(() => []),
        ]);

        setProfile(profileData);
        setHostedOutings(hostedData);
        setJoinedOutings(historyData);
      }
    } catch (err: any) {
      console.error("Error loading profile:", err);
      toast.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear();
      toast.success("Signed out successfully");
      navigate({
        to: "/auth",
        replace: true,
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Error signing out");
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `${profile?.name || "User"}'s OutSy Profile`,
      text: `Check out ${profile?.name || "this"}'s profile and outings on OutSy!`,
      url: profileUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.info("Could not copy link to clipboard");
    }
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    try {
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      setEditModalOpen(false);
      toast.success("Profile updated successfully!");
      await queryClient.invalidateQueries();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 text-center px-6">
        <h3 className="text-lg font-bold text-foreground">User Profile Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          This user profile could not be loaded or does not exist.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/explore" });
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-foreground cursor-pointer hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
          <button
            onClick={loadData}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground cursor-pointer hover:opacity-90 shadow-glow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-xl px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-24">
        {/* Instagram Top Bar */}
        <Header
          profile={profile}
          isOwnProfile={isOwnProfile}
          onSettingsClick={() => setDrawerOpen(true)}
          onShareClick={handleShareProfile}
        />

        {/* Instagram Bio, Avatar & Stats */}
        <ProfileCard
          profile={profile}
          isOwnProfile={isOwnProfile}
          savedCount={savedOutings.length}
          onEditClick={() => setEditModalOpen(true)}
          onShareClick={handleShareProfile}
          onHostDashboardClick={() => navigate({ to: "/host-dashboard" })}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Instagram Story Highlights for Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <Interests
            interests={profile.interests}
            onAddInterestClick={isOwnProfile ? () => setEditModalOpen(true) : undefined}
          />
        )}

        {/* Instagram Outing Grid & Tabs */}
        <ProfileGrid
          activeTab={activeTab === "saved" && !isOwnProfile ? "hosted" : activeTab}
          onTabChange={setActiveTab}
          isOwnProfile={isOwnProfile}
          hostedOutings={hostedOutings}
          joinedOutings={joinedOutings}
          savedOutings={savedOutings}
        />
      </main>

      {/* Settings Drawer (Own profile only) */}
      {isOwnProfile && (
        <SettingsDrawer
          open={drawerOpen}
          darkMode={theme === "dark"}
          onClose={() => setDrawerOpen(false)}
          onDarkMode={toggle}
          onEditProfile={() => {
            setDrawerOpen(false);
            setEditModalOpen(true);
          }}
          onLogout={logout}
        />
      )}

      {/* Edit Profile Modal (Own profile only) */}
      {isOwnProfile && (
        <EditProfileModal
          open={editModalOpen}
          profile={profile}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}
