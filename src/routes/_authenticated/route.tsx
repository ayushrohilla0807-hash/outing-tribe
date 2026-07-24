import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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
  return (
    <SavedProvider>
      <div className="min-h-screen bg-background">
        <main className="pb-24">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </SavedProvider>
  );
}