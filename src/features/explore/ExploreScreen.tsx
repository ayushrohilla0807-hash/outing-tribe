import { useEffect, useState } from "react";

import JoinDialog from "@/features/outing/join/widgets/JoinDialog";
import { useJoinRequest } from "@/features/outing/join/hooks/useJoinRequest";

import SearchBar from "./widgets/SearchBar";
import CategoryFilter from "./widgets/CategoryFilter";
import FilterButton from "./widgets/FilterButton";
import FilterDrawer from "./widgets/FilterDrawer";
import OutingCard from "./widgets/OutingCard";
import EmptyState from "./widgets/EmptyState";

import type { ExploreOuting } from "./models/outing";
import { getExploreOutings } from "./services/exploreService";
import { useExploreFilters } from "./hooks/useExploreFilters";

export default function ExploreScreen() {
  const [outings, setOutings] = useState<ExploreOuting[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [city, setCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState("Newest");

  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedOuting, setSelectedOuting] =
    useState<ExploreOuting | null>(null);

  const [joinDialogOpen, setJoinDialogOpen] =
    useState(false);

  const {
    getStatus,
    sendRequest,
    cancelRequest,
  } = useJoinRequest();

  useEffect(() => {
    getExploreOutings().then(setOutings);
  }, []);

  const filtered = useExploreFilters({
    outings,
    search,
    category,
    city,
    sortBy,
  });

  return (
    <>
      <main className="mx-auto max-w-2xl px-5 py-8 pb-32">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            Explore
          </h1>

          <FilterButton
            onClick={() => setFilterOpen(true)}
          />
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
        />

        <CategoryFilter
          value={category}
          onChange={setCategory}
        />

        <div className="mt-8 space-y-6">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((outing) => (
              <OutingCard
                key={outing.id}
                outing={{
                  ...outing,
                  joinStatus: getStatus(outing.id),

                  onJoin: () => {
                    setSelectedOuting(outing);
                    setJoinDialogOpen(true);
                  },

                  onCancel: () => {
                    cancelRequest(outing.id);
                  },
                }}
              />
            ))
          )}
        </div>

        {joinDialogOpen && selectedOuting && (
          <JoinDialog
            outing={selectedOuting}
            onClose={() =>
              setJoinDialogOpen(false)
            }
            onConfirm={() => {
              sendRequest(selectedOuting.id);
              setJoinDialogOpen(false);
            }}
          />
        )}
      </main>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        city={city}
        setCity={setCity}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </>
  );
}