import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { useTheme } from "@/hooks/use-theme";

import type { UserProfile } from "./models/profile";
import { getProfile, updateProfile } from "./services/profileService";

import Header from "./widgets/Header";
import ProfileCard from "./widgets/ProfileCard";
import Interests from "./widgets/Interests";
import Stats from "./widgets/Stats";
import MenuList from "./widgets/MenuList";
import SettingsDrawer from "./widgets/SettingsDrawer";
import EditProfileModal from "./widgets/EditProfileModal";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    try {
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      setEditModalOpen(false);
      toast.success("Profile updated successfully!");
      // Invalidate profile queries
      await queryClient.invalidateQueries();
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
        <p className="text-muted-foreground">Could not load profile.</p>
        <button
          onClick={loadProfile}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-xl px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8">
        <Header onSettingsClick={() => setDrawerOpen(true)} />

        <ProfileCard profile={profile} />

        <Stats profile={profile} />

        <Interests interests={profile.interests} />

        <MenuList
          onSaved={() => {
            navigate({
              to: "/saved",
            });
          }}
          onHistory={() => {
            navigate({
              to: "/history",
            });
          }}
          onHostDashboard={() => {
            navigate({
              to: "/host-dashboard",
            });
          }}
          onLogout={logout}
        />
      </main>

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

      <EditProfileModal
        open={editModalOpen}
        profile={profile}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}
