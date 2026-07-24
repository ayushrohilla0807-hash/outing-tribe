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

export default function FilterDrawer({
  open,
  onClose,
  city,
  setCity,
  sortBy,
  setSortBy,
}: Props) {
  const [tempCity, setTempCity] =
    useState(city);

  const [tempSortBy, setTempSortBy] =
    useState(sortBy);

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
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-16 z-50 mx-auto w-full max-w-2xl rounded-t-3xl bg-background p-6 shadow-2xl">

        <div className="mb-4 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        <h2 className="mb-6 text-center text-2xl font-bold">
          Filters
        </h2>

        <div className="space-y-5">

          <div>
            <label className="mb-2 block font-medium">
              📍 City
            </label>

            <select
              value={tempCity}
              onChange={(e) =>
                setTempCity(e.target.value)
              }
              className="w-full rounded-xl border p-3"
            >
              {CITIES.map((city) => (
                <option
                  key={city}
                  value={city}
                >
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              ↕ Sort By
            </label>

            <select
              value={tempSortBy}
              onChange={(e) =>
                setTempSortBy(e.target.value)
              }
              className="w-full rounded-xl border p-3"
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">

            <button
              className="flex-1 rounded-xl border py-3"
              onClick={() => {
                setTempCity("All Cities");
                setTempSortBy("Newest");

                setCity("All Cities");
                setSortBy("Newest");

                onClose();
              }}
            >
              Clear
            </button>

            <button
              className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
              onClick={() => {
                setCity(tempCity);
                setSortBy(tempSortBy);

                onClose();
              }}
            >
              Apply
            </button>

          </div>

        </div>

      </div>
    </>
  );
}