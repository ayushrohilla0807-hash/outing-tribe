import { useState } from "react";

import Header from "./widgets/Header";
import SearchBar from "./widgets/SearchBar";
import QuickActions from "./widgets/QuickActions";
import RecommendedSection from "./widgets/RecommendedSection";

export default function HomeScreen() {
  const [search, setSearch] = useState("");

  return (
    <main className="mx-auto max-w-3xl px-5 py-6">

      <Header
        userName="Ayush"
        location="Delhi, India"
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        onFilterClick={() => console.log("Filters")}
      />

      <QuickActions
        onCreate={() => console.log("Create")}
        onNearby={() => console.log("Nearby")}
        onSaved={() => console.log("Saved")}
        onSurprise={() => console.log("Surprise")}
      />

      <RecommendedSection />

    </main>
  );
}