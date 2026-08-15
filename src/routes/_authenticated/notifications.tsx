import { createFileRoute } from "@tanstack/react-router";
import NotificationsScreen from "@/features/notifications/NotificationsScreen";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsScreen,
});
