import { createFileRoute } from "@tanstack/react-router";
import ParticipantsScreen from "@/features/host/participants/ParticipantsScreen";

export const Route = createFileRoute(
  "/_authenticated/participants/$outingId"
)({
  component: ParticipantsScreen,
});