import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import DashboardHeader from "./widgets/DashboardHeader";
import EmptyState from "./widgets/EmptyState";
import HostedOutingCard from "./widgets/HostedOutingCard";
import StatusTabs from "./widgets/StatusTabs";
import StatCard from "./widgets/StatCard";
import SearchBar from "./widgets/SearchBar";
import CategoryFilter from "./widgets/CategoryFilter";

import { getHostedOutings } from "./services/hostDashboardService";

import type {
  HostedOuting,
  HostedOutingStatus,
} from "./models/hostedOuting";

export default function HostDashboard() {
  const navigate = useNavigate();

  const [selected, setSelected] =
    useState<HostedOutingStatus>("upcoming");

  const [outings, setOutings] =
    useState<HostedOuting[]>(getHostedOutings());

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");

  // Live Analytics
  const stats = {
    hosted: outings.length,

    upcoming: outings.filter(
      (outing) => outing.status === "upcoming"
    ).length,

    completed: outings.filter(
      (outing) => outing.status === "completed"
    ).length,

    cancelled: outings.filter(
      (outing) => outing.status === "cancelled"
    ).length,

    participants: outings.reduce(
      (total, outing) => total + outing.joined,
      0
    ),
  };

  // Search + Filters
  const filtered = useMemo(() => {
    return outings.filter((outing) => {
      const statusMatch =
        outing.status === selected;

      const searchMatch = outing.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const categoryMatch =
        category === "All" ||
        outing.category === category;

      return (
        statusMatch &&
        searchMatch &&
        categoryMatch
      );
    });
  }, [
    outings,
    selected,
    search,
    category,
  ]);

  // Complete Outing
  function handleComplete(id: string) {
    setOutings((prev) =>
      prev.map((outing) =>
        outing.id === id
          ? {
              ...outing,
              status: "completed",
            }
          : outing
      )
    );
  }

  // Cancel Outing
  function handleCancel(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this outing?"
    );

    if (!confirmed) return;

    setOutings((prev) =>
      prev.map((outing) =>
        outing.id === id
          ? {
              ...outing,
              status: "cancelled",
            }
          : outing
      )
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <DashboardHeader
        totalOutings={outings.length}
      />

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          title="Hosted"
          value={stats.hosted}
        />

        <StatCard
          title="Upcoming"
          value={stats.upcoming}
        />

        <StatCard
          title="Completed"
          value={stats.completed}
        />

        <StatCard
          title="Cancelled"
          value={stats.cancelled}
        />

        <StatCard
          title="Participants"
          value={stats.participants}
        />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
          />
        </div>

        <CategoryFilter
          value={category}
          onChange={setCategory}
        />
      </div>

      {/* Status Tabs */}
      <StatusTabs
        selected={selected}
        onChange={setSelected}
      />

      {/* Outings */}
      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${selected} outings`}
          description="Try changing the search or filters."
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
              onCancel={handleCancel}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}