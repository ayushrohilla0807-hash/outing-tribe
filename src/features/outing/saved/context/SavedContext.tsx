import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { SavedOuting } from "../models/savedOuting";

type SavedContextType = {
  savedOutings: SavedOuting[];

  toggleSaved: (outing: SavedOuting) => void;

  isSaved: (id: string) => boolean;
};

const SavedContext = createContext<
  SavedContextType | undefined
>(undefined);

export function SavedProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedOutings, setSavedOutings] = useState<
    SavedOuting[]
  >([]);

  const toggleSaved = (outing: SavedOuting) => {
    setSavedOutings((prev) => {
      const exists = prev.some(
        (item) => item.id === outing.id,
      );

      if (exists) {
        return prev.filter(
          (item) => item.id !== outing.id,
        );
      }

      return [...prev, outing];
    });
  };

  const isSaved = (id: string) => {
    return savedOutings.some(
      (item) => item.id === id,
    );
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
    throw new Error(
      "useSaved must be used inside SavedProvider",
    );
  }

  return context;
}