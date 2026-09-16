import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/navigation/BottomNav";
import { SavedProvider } from "@/features/outing/saved/context/SavedContext";
import { hasAcceptedCurrentTerms } from "@/config/terms";
import { needsProfileSetup } from "@/features/profile/services/profileService";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,

  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    if (!hasAcceptedCurrentTerms(data.user)) {
      throw redirect({ to: "/consent" });
    }

    const needs = await needsProfileSetup();
    if (needs) {
      throw redirect({ to: "/profile-setup" });
    }

    return { user: data.user };
  },

  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // Check if current route is an active chat room: /chats/:outingId/...
  const isChatScreen = /^\/chats\/.+/.test(pathname);

  return (
    <SavedProvider>
      <div
        className={
          isChatScreen
            ? "fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground"
            : "min-h-[100dvh] flex flex-col bg-background text-foreground"
        }
      >
        <main
          className={
            isChatScreen
              ? "flex-1 min-h-0 flex flex-col overflow-hidden h-full w-full"
              : "flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"
          }
        >
          <Outlet />
        </main>

        {!isChatScreen && <BottomNav />}
      </div>
    </SavedProvider>
  );
}
