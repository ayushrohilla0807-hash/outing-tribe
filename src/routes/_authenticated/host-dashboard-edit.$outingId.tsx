import { createFileRoute } from "@tanstack/react-router";
import EditOutingScreen from "@/features/host/edit/EditOutingScreen";

export const Route = createFileRoute("/_authenticated/host-dashboard-edit/$outingId")({
  component: EditOutingScreen,
});
