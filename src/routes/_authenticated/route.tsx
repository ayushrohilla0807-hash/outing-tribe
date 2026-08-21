import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/navigation/BottomNav";
import { SavedProvider } from "@/features/outing/saved/context/SavedContext";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,

  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }

    return { user: data.user };
  },

  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // Check if current route is an individual chat screen: /chats/:outingId/:userId
  const isIndividualChat = /^\/chats\/[^/]+\/[^/]+/.test(pathname);

  return (
    <SavedProvider>
      <div className="min-h-screen bg-background text-foreground">
        <main className={isIndividualChat ? "" : "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"}>
          <Outlet />
        </main>

        {!isIndividualChat && <BottomNav />}
      </div>
    </SavedProvider>
  );
}
