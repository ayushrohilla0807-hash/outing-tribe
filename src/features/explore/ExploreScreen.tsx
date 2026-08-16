import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SearchBar from "./widgets/SearchBar";
import CategoryFilter from "./widgets/CategoryFilter";
import FilterButton from "./widgets/FilterButton";
import FilterDrawer from "./widgets/FilterDrawer";
import OutingCard from "./widgets/OutingCard";
import EmptyState from "./widgets/EmptyState";

import { getExploreOutings } from "./services/exploreService";
import { useExploreFilters } from "./hooks/useExploreFilters";

export default function ExploreScreen() {
  const {
    data: outings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["explore-outings"],
    queryFn: getExploreOutings,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [city, setCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState("Newest");

  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useExploreFilters({
    outings,
    search,
    category,
    city,
    sortBy,
  });

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading outings...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-destructive">{(error as Error).message}</p>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-2xl px-5 py-8 pb-32">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Explore</h1>

          <FilterButton onClick={() => setFilterOpen(true)} />
        </div>

        <SearchBar value={search} onChange={setSearch} />

        <CategoryFilter value={category} onChange={setCategory} />

        <div className="mt-8 space-y-6">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((outing) => <OutingCard key={outing.id} outing={outing} />)
          )}
        </div>
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
