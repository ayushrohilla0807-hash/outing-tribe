import { createFileRoute } from "@tanstack/react-router";

import CreateOutingScreen from "@/features/outing/CreateOutingScreen";

export const Route = createFileRoute("/_authenticated/create")({
  component: CreateOutingScreen,
});