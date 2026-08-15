import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import Header from "./widgets/Header";
import SearchBar from "./widgets/SearchBar";
import QuickActions from "./widgets/QuickActions";
import RecommendedSection from "./widgets/RecommendedSection";
import { getProfile } from "@/features/profile/services/profileService";
import { getExploreOutings } from "@/features/explore/services/exploreService";

export default function HomeScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getProfile,
  });

  const { data: outings = [] } = useQuery({
    queryKey: ["explore-outings"],
    queryFn: getExploreOutings,
  });

  const handleSurprise = () => {
    if (outings.length > 0) {
      const randomOuting = outings[Math.floor(Math.random() * outings.length)];
      navigate({
        to: "/outing/$id",
        params: { id: randomOuting.id },
      });
    } else {
      navigate({ to: "/explore" });
    }
  };

  const handleSearchSubmit = () => {
    if (search.trim()) {
      navigate({ to: "/explore" });
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-6 pb-32">
      <Header
        userName={profile?.name || "Friend"}
        location={profile?.city ? `${profile.city}, India` : "Explore nearby"}
      />

      <div className="mt-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          onFilterClick={() => navigate({ to: "/explore" })}
        />
      </div>

      <QuickActions
        onCreate={() => navigate({ to: "/create" })}
        onNearby={() => navigate({ to: "/explore" })}
        onSaved={() => navigate({ to: "/saved" })}
        onSurprise={handleSurprise}
      />

      <RecommendedSection />
    </main>
  );
}
