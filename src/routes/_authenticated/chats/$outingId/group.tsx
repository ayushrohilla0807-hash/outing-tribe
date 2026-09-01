import { createFileRoute } from "@tanstack/react-router";
import GroupChatScreen from "@/features/chats/GroupChatScreen";

export const Route = createFileRoute("/_authenticated/chats/$outingId/group")({
  component: GroupChatScreen,
});
