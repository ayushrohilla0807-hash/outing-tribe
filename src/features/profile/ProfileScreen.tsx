import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

import { useTheme } from "@/hooks/use-theme";

import type { UserProfile } from "./models/profile";
import { getProfile } from "./services/profileService";

import Header from "./widgets/Header";
import ProfileCard from "./widgets/ProfileCard";
import Interests from "./widgets/Interests";
import Stats from "./widgets/Stats";
import MenuList from "./widgets/MenuList";
import SettingsDrawer from "./widgets/SettingsDrawer";
import EditProfileModal from "./widgets/EditProfileModal";

export default function ProfileScreen() {
  const navigate = useNavigate();

  const { theme, toggle } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const data = await getProfile();
      setProfile(data);
    }

    loadProfile();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();

    navigate({
      to: "/auth",
      replace: true,
    });
  };

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Loading Profile...
        </p>
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-xl px-5 py-6 pb-32">

        <Header
          onSettingsClick={() => setDrawerOpen(true)}
        />

        <ProfileCard
          profile={profile}
        />

        <Stats
          profile={profile}
        />

        <Interests
          interests={profile.interests}
        />

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
        onSave={(updatedProfile) => {
          setProfile(updatedProfile);
          setEditModalOpen(false);
        }}
      />
    </>
  );
}