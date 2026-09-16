import { useState, useEffect } from "react";

/**
 * Tracks the browser's Visual Viewport height (excluding virtual on-screen keyboards).
 * Automatically handles window scrolling lock to prevent blank voids under inputs.
 */
export function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;

    const updateViewport = () => {
      const currentHeight = vv.height;
      setViewportHeight(currentHeight);

      // If visual viewport height is significantly less than window.innerHeight, keyboard is active
      const keyboardActive = currentHeight < window.innerHeight - 80;
      setIsKeyboardOpen(keyboardActive);

      // Force window scroll back to 0 so no viewport gaps open under fixed/flex elements
      if (window.scrollY !== 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
    };

    updateViewport();

    vv.addEventListener("resize", updateViewport);
    vv.addEventListener("scroll", updateViewport);

    return () => {
      vv.removeEventListener("resize", updateViewport);
      vv.removeEventListener("scroll", updateViewport);
    };
  }, []);

  return { viewportHeight, isKeyboardOpen };
}
