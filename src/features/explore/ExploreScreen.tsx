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
      <main className="mx-auto max-w-2xl px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-36 bg-white/10 rounded-2xl animate-pulse" />
          <div className="h-10 w-10 bg-white/10 rounded-2xl animate-pulse" />
        </div>
        <div className="h-12 w-full bg-white/10 rounded-2xl animate-pulse mb-4" />
        <div className="flex gap-2 overflow-hidden mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-white/10 rounded-full animate-pulse shrink-0" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-64 w-full bg-white/10 rounded-3xl animate-pulse" />
          <div className="h-64 w-full bg-white/10 rounded-3xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Failed to load outings</h2>
        <p className="mt-2 text-sm text-destructive">{(error as Error).message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Explore</h1>

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
