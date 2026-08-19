import { useEffect, useState } from "react";

import { CITIES } from "../constants/cities";
import { SORT_OPTIONS } from "../constants/sortOptions";

type Props = {
  open: boolean;
  onClose: () => void;

  city: string;
  setCity: (value: string) => void;

  sortBy: string;
  setSortBy: (value: string) => void;
};

export default function FilterDrawer({ open, onClose, city, setCity, sortBy, setSortBy }: Props) {
  const [tempCity, setTempCity] = useState(city);

  const [tempSortBy, setTempSortBy] = useState(sortBy);

  useEffect(() => {
    if (open) {
      setTempCity(city);
      setTempSortBy(sortBy);
    }
  }, [open, city, sortBy]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg rounded-t-3xl border-t border-white/10 bg-background/98 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-foreground">
          Filter Outings
        </h2>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">📍 City</label>

            <select
              value={tempCity}
              onChange={(e) => setTempCity(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-white/5 p-3.5 text-sm text-foreground outline-none focus:border-primary transition"
            >
              {CITIES.map((city) => (
                <option key={city} value={city} className="bg-background text-foreground">
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">↕ Sort By</label>

            <select
              value={tempSortBy}
              onChange={(e) => setTempSortBy(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-white/5 p-3.5 text-sm text-foreground outline-none focus:border-primary transition"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-background text-foreground">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              className="flex-1 rounded-full border border-white/15 bg-white/5 py-3 text-sm font-semibold text-foreground hover:bg-white/10 active:scale-98 transition cursor-pointer"
              onClick={() => {
                setTempCity("All Cities");
                setTempSortBy("Newest");

                setCity("All Cities");
                setSortBy("Newest");

                onClose();
              }}
            >
              Reset
            </button>

            <button
              type="button"
              className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 active:scale-98 transition cursor-pointer"
              onClick={() => {
                setCity(tempCity);
                setSortBy(tempSortBy);

                onClose();
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
