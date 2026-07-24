import { createFileRoute } from "@tanstack/react-router";
import ChatScreen from "@/features/chats/ChatScreen";

export const Route = createFileRoute("/_authenticated/chats/$chatId")({
  component: ChatScreen,
});