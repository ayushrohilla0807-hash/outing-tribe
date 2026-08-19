import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import {
  canAccessChat,
  getCurrentUser,
  getMessages,
  sendMessage,
  subscribeMessages,
} from "./services/chatService";

import ChatHeader from "./widgets/ChatHeader";
import ChatInput from "./widgets/ChatInput";
import MessageBubble from "./widgets/MessageBubble";

import type { Chat, Message } from "./models/message";

export default function ChatScreen() {
  const { outingId, userId } = useParams({
    from: "/_authenticated/chats/$outingId/$userId",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(
    async (myId: string) => {
      try {
        const data = await getMessages(outingId, myId, userId);

        const formatted: Message[] = data.map((m) => ({
          id: m.id,
          outingId: m.outing_id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          message: m.message,
          createdAt: m.created_at ?? "",
          isMine: m.sender_id === myId,
        }));

        setMessages(formatted);
      } catch (err) {
        console.error(err);
      }
    },
    [outingId, userId],
  );

  const loadChat = useCallback(async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      if (!user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      const allowed = await canAccessChat(outingId);

      if (!allowed) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);
      setCurrentUserId(user.id);

      // Fetch Outing info
      const { data: outing } = await supabase
        .from("outings")
        .select("id, title, cover_image")
        .eq("id", outingId)
        .single();

      // Fetch other user profile
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      const { count } = await supabase
        .from("participants")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("outing_id", outingId)
        .eq("status", "joined");

      setChat({
        outingId,
        otherUserId: userId,
        outingName: outing?.title ?? "Outing",
        outingImage: outing?.cover_image ?? null,
        otherUserName: otherProfile?.full_name ?? "Participant",
        otherUserAvatar: otherProfile?.avatar_url ?? null,
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
        participants: (count ?? 0) + 1, // include host
      });

      await loadMessages(user.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chat conversation");
    } finally {
      setLoading(false);
    }
  }, [outingId, userId, navigate, loadMessages]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (!currentUserId || !authorized) return;

    const channel = subscribeMessages(outingId, () => {
      loadMessages(currentUserId);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [outingId, currentUserId, authorized, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSend(text: string) {
    if (!currentUserId || !text.trim()) return;

    try {
      await sendMessage(outingId, currentUserId, userId, text);
      await loadMessages(currentUserId);
      await queryClient.invalidateQueries({ queryKey: ["accepted-chats"] });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send message");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Chat Restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You can only access this chat once your join request has been accepted by the host.
        </p>
        <button
          onClick={() => navigate({ to: "/explore" })}
          className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Explore Other Outings
        </button>
      </div>
    );
  }

  if (!chat) {
    return <div className="flex h-screen items-center justify-center">Chat not available.</div>;
  }

  return (
    <main className="flex h-[calc(100dvh-5rem-env(safe-area-inset-bottom,0px))] flex-col bg-background text-foreground">
      <ChatHeader
        title={chat.otherUserName ? `${chat.otherUserName} • ${chat.outingName}` : chat.outingName}
        image={chat.otherUserAvatar || chat.outingImage}
        participants={chat.participants}
        onBack={() =>
          navigate({
            to: "/chats",
          })
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <p className="text-sm font-medium">No messages yet.</p>
            <p className="text-xs mt-1">Send a message to start planning the meetup!</p>
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 bg-surface/90 p-3.5 sm:p-4 backdrop-blur-xl">
        <ChatInput onSend={handleSend} />
      </div>
    </main>
  );
}
