import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import type { SavedOuting } from "../models/savedOuting";

const STORAGE_KEY = "outsy_saved_outings";

type SavedContextType = {
  savedOutings: SavedOuting[];
  toggleSaved: (outing: SavedOuting) => void;
  isSaved: (id: string) => boolean;
};

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedOutings, setSavedOutings] = useState<SavedOuting[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOutings));
    } catch (e) {
      console.error("Failed to save outings to localStorage:", e);
    }
  }, [savedOutings]);

  const toggleSaved = (outing: SavedOuting) => {
    setSavedOutings((prev) => {
      const exists = prev.some((item) => item.id === outing.id);

      if (exists) {
        toast.info(`Removed "${outing.title}" from saved`);
        return prev.filter((item) => item.id !== outing.id);
      }

      toast.success(`Saved "${outing.title}" to bookmarks!`);
      return [...prev, outing];
    });
  };

  const isSaved = (id: string) => {
    return savedOutings.some((item) => item.id === id);
  };

  return (
    <SavedContext.Provider
      value={{
        savedOutings,
        toggleSaved,
        isSaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);

  if (!context) {
    throw new Error("useSaved must be used inside SavedProvider");
  }

  return context;
}
