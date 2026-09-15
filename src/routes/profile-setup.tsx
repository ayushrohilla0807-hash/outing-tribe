import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { needsProfileSetup } from "@/features/profile/services/profileService";
import { hasAcceptedCurrentTerms } from "@/config/terms";
import ProfileSetupScreen from "@/features/profile/ProfileSetupScreen";

export const Route = createFileRoute("/profile-setup")({
  ssr: false,

  beforeLoad: async () => {
    // Must be authenticated
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }

    // Must have accepted current terms
    if (!hasAcceptedCurrentTerms(data.user)) {
      throw redirect({ to: "/consent" });
    }

    // If they have already completed setup, skip straight to home
    const needs = await needsProfileSetup();
    if (!needs) {
      throw redirect({ to: "/home" });
    }
  },

  component: ProfileSetupPage,

  head: () => ({
    meta: [
      { title: "Complete your profile — Outsy" },
      {
        name: "description",
        content: "Set up your Outsy profile to start discovering outings near you.",
      },
    ],
  }),
});

function ProfileSetupPage() {
  return <ProfileSetupScreen />;
}
