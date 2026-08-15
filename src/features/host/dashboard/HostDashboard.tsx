import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import DashboardHeader from "./widgets/DashboardHeader";
import EmptyState from "./widgets/EmptyState";
import HostedOutingCard from "./widgets/HostedOutingCard";
import StatusTabs from "./widgets/StatusTabs";
import StatCard from "./widgets/StatCard";
import SearchBar from "./widgets/SearchBar";
import CategoryFilter from "./widgets/CategoryFilter";

import { cancelOuting, getHostedOutings, markCompleted } from "./services/hostDashboardService";

import type { HostedOuting, HostedOutingStatus } from "./models/hostedOuting";

import { supabase } from "@/integrations/supabase/client";

export default function HostDashboard() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<HostedOutingStatus>("upcoming");
  const [outings, setOutings] = useState<HostedOuting[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostId, setHostId] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  async function loadOutings() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      setHostId(user.id);

      const data = await getHostedOutings();
      setOutings(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your outings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOutings();
  }, []);

  const stats = {
    hosted: outings.length,
    upcoming: outings.filter((o) => o.status === "upcoming").length,
    completed: outings.filter((o) => o.status === "completed").length,
    cancelled: outings.filter((o) => o.status === "cancelled").length,
    participants: outings.reduce((sum, o) => sum + o.joined, 0),
    pending: outings.reduce((sum, o) => sum + (o.pending ?? 0), 0),
  };

  const filtered = useMemo(() => {
    return outings.filter((outing) => {
      const statusMatch = outing.status === selected;
      const searchMatch = outing.title.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = category === "All" || outing.category === category;

      return statusMatch && searchMatch && categoryMatch;
    });
  }, [outings, selected, search, category]);

  async function handleComplete(id: string) {
    try {
      await markCompleted(id, hostId);
      toast.success("Outing marked as completed!");
      await loadOutings();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to complete outing");
    }
  }

  async function handleCancel(id: string) {
    if (!window.confirm("Are you sure you want to cancel this outing? This cannot be undone.")) {
      return;
    }

    try {
      await cancelOuting(id, hostId);
      toast.success("Outing cancelled.");
      await loadOutings();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to cancel outing");
    }
  }

  if (loading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your outings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 pb-32">
      <DashboardHeader totalOutings={outings.length} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard title="Hosted" value={stats.hosted} />
        <StatCard title="Upcoming" value={stats.upcoming} />
        <StatCard title="Completed" value={stats.completed} />
        <StatCard title="Participants" value={stats.participants} />
        <StatCard title="Pending" value={stats.pending} />
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <StatusTabs selected={selected} onChange={setSelected} />

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${selected} outings`}
          description={
            selected === "upcoming"
              ? "Create your first outing to get started."
              : "Nothing here yet."
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((outing) => (
            <HostedOutingCard
              key={outing.id}
              outing={outing}
              onParticipants={(id) =>
                navigate({
                  to: "/participants/$outingId",
                  params: {
                    outingId: id,
                  },
                })
              }
              onEdit={(id) =>
                navigate({
                  to: "/host-dashboard-edit/$outingId",
                  params: {
                    outingId: id,
                  },
                })
              }
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
