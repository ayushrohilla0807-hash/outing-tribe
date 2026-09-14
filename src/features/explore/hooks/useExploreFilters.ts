import { useEffect, useMemo, useState } from "react";
import { isOutingActive } from "@/lib/outingDate";
import type { ExploreOuting } from "../models/outing";

type Props = {
  outings: ExploreOuting[];
  search: string;
  category: string;
  city: string;
  sortBy: string;
};

export function useExploreFilters({ outings, search, category, city, sortBy }: Props) {
  // Live ticker ensures outings that pass their end time while viewing the page disappear in real-time
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    let result = outings.filter((outing) => {
      // Must not be expired (end_datetime > now)
      if (!isOutingActive(outing, now)) {
        return false;
      }

      const categoryMatch = category === "All" || outing.category === category;

      const cityMatch =
        city === "All Cities" || outing.location.toLowerCase().includes(city.toLowerCase());

      const searchMatch =
        outing.title.toLowerCase().includes(search.toLowerCase()) ||
        outing.location.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && cityMatch && searchMatch;
    });

    switch (sortBy) {
      case "Popular":
        result = [...result].sort((a, b) => b.participants - a.participants);
        break;

      case "Highest Rated":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;

      default:
        break;
    }

    return result;
  }, [outings, search, category, city, sortBy, now]);
}
