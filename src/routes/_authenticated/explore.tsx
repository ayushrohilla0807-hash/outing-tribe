import { createFileRoute } from "@tanstack/react-router";

import ExploreScreen from "@/features/explore/ExploreScreen";

export const Route = createFileRoute(
  "/_authenticated/explore",
)({
  component: ExploreScreen,
});