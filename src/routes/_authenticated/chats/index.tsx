import { createFileRoute } from "@tanstack/react-router";
import ChatListScreen from "@/features/chats/ChatListScreen";

export const Route = createFileRoute("/_authenticated/chats/")({
  component: ChatListScreen,
});