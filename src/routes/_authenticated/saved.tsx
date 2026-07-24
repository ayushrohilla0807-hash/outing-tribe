import { createFileRoute } from "@tanstack/react-router";
import SavedScreen from "@/features/outing/saved/SavedScreen";

export const Route = createFileRoute(
  "/_authenticated/saved",
)({
  component: SavedScreen,
});