import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "outsy-theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // ignore
  }
  return "dark";
}

let currentTheme: Theme = getStoredTheme();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function applyThemeToDOM(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

export function setThemeState(newTheme: Theme) {
  currentTheme = newTheme;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
  } catch {
    // ignore
  }
  applyThemeToDOM(newTheme);
  emitChange();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

if (typeof window !== "undefined") {
  // Listen for storage events (e.g. cross-tab changes)
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      currentTheme = e.newValue;
      applyThemeToDOM(currentTheme);
      emitChange();
    }
  });

  // Ensure DOM is in sync on client load
  applyThemeToDOM(currentTheme);
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => "dark" as Theme,
  );

  const toggle = () => {
    const next: Theme = currentTheme === "dark" ? "light" : "dark";
    setThemeState(next);
  };

  const setTheme = (t: Theme | ((prev: Theme) => Theme)) => {
    const next = typeof t === "function" ? t(currentTheme) : t;
    setThemeState(next);
  };

  return { theme, toggle, setTheme };
}
