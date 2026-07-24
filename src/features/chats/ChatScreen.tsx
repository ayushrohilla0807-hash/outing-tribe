import { useParams, useNavigate } from "@tanstack/react-router";

import { getChat } from "./services/chatService";

import ChatHeader from "./widgets/ChatHeader";
import MessageBubble from "./widgets/MessageBubble";
import ChatInput from "./widgets/ChatInput";

import { useEffect, useState } from "react";
import type { Chat, Message } from "./models/chat";

export default function ChatScreen() {
  const { chatId } = useParams({
    from: "/_authenticated/chats/$chatId",
  });

  const navigate = useNavigate();

  const [chat, setChat] = useState<Chat | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    async function loadChat() {
      const data = await getChat(chatId);

      if (data) {
        setChat(data);
        setMessages(data.messages);
      }
    }

    loadChat();
  }, [chatId]);

  function handleSend(text: string) {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "You",
      text,
      sentAt: "Now",
      isMine: true,
    };

    setMessages((prev) => [...prev, newMessage]);
  }

  if (!chat) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading chat...
      </div>
    );
  }

  return (
<main className="flex h-[calc(100vh-80px)] flex-col">
      <ChatHeader
        title={chat.outingName}
        image={chat.outingImage}
        participants={chat.participants}
        onBack={() => navigate({ to: "/chats" })}
      />

<div className="flex-1 overflow-y-auto pb-24">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

      </div>

      <div className="border-t bg-background p-4">
      <ChatInput onSend={handleSend} />
      </div>

    </main>
  );
}