import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { Chat } from "./models/chat";
import { getAcceptedChats } from "./services/chatService";

import ChatCard from "./widgets/ChatCard";
import EmptyState from "./widgets/EmptyState";

export default function ChatListScreen() {
  const navigate = useNavigate();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      const data = await getAcceptedChats();
      setChats(data);
      setLoading(false);
    }

    loadChats();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-6">
        <h1 className="mb-8 text-4xl font-bold">
          Chats
        </h1>

        <p className="text-muted-foreground">
          Loading chats...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-6 pb-32">

      <h1 className="mb-8 text-4xl font-bold">
        Chats
      </h1>

      {chats.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">

          {chats.map((chat) => (
            <ChatCard
              key={chat.id}
              chat={chat}
              onClick={() =>
                navigate({
                  to: "/chats/$chatId",
                  params: {
                    chatId: chat.id,
                  },
                })
              }
            />
          ))}

        </div>
      )}

    </main>
  );
}