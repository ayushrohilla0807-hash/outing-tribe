import { createFileRoute } from "@tanstack/react-router";
import HostDashboard from "@/features/host/dashboard/HostDashboard";

export const Route = createFileRoute("/_authenticated/host-dashboard")({
  component: HostDashboard,
});
