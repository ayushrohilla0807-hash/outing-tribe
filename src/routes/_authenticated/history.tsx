import { createFileRoute } from "@tanstack/react-router";

import HistoryScreen from "@/features/outing/history/HistoryScreen";

export const Route = createFileRoute(
  "/_authenticated/history",
)({
  component: HistoryScreen,
});