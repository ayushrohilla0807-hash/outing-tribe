import { mockChats } from "../data/mockChats";

export async function getAcceptedChats() {
  return mockChats.filter(
    (chat) => chat.status === "accepted",
  );
}

export async function getChat(chatId: string) {
  return mockChats.find(
    (chat) => chat.id === chatId,
  );
}