import { useMemo } from "react";

import type { ExploreOuting } from "../models/outing";

type Props = {
  outings: ExploreOuting[];
  search: string;
  category: string;
  city: string;
  sortBy: string;
};

export function useExploreFilters({
  outings,
  search,
  category,
  city,
  sortBy,
}: Props) {
  return useMemo(() => {
    let result = outings.filter((outing) => {
      const categoryMatch =
        category === "All" ||
        outing.category === category;

      const cityMatch =
        city === "All Cities" ||
        outing.location
          .toLowerCase()
          .includes(city.toLowerCase());

      const searchMatch =
        outing.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        outing.location
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        categoryMatch &&
        cityMatch &&
        searchMatch
      );
    });

    switch (sortBy) {
      case "Popular":
        result = [...result].sort(
          (a, b) =>
            (b.participants ?? 0) -
            (a.participants ?? 0)
        );
        break;

      case "Highest Rated":
        result = [...result].sort(
          (a, b) =>
            (b.rating ?? 0) -
            (a.rating ?? 0)
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    outings,
    search,
    category,
    city,
    sortBy,
  ]);
}