import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import {
  canAccessGroupChat,
  ensureOutingGroup,
  getGroupMessages,
  sendGroupMessage,
  subscribeGroupMessages,
  subscribeGroupMessageReads,
  setGroupChatLastRead,
  markMessagesAsSeen,
  deleteGroupMessage,
} from "./services/groupChatService";
import { getCurrentUser } from "./services/chatService";

import ChatHeader from "./widgets/ChatHeader";
import ChatInput from "./widgets/ChatInput";
import GroupMessageBubble from "./widgets/GroupMessageBubble";

import type { Message } from "./models/message";

export default function GroupChatScreen() {
  const { outingId } = useParams({
    strict: false,
  }) as { outingId: string };

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [outingTitle, setOutingTitle] = useState("");
  const [outingImage, setOutingImage] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [groupId, setGroupId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    fullName: string;
    avatarUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const markedSeenIdsRef = useRef<Set<string>>(new Set());

  const markUnseenMessages = useCallback(async (msgs: Message[], userId: string) => {
    if (!userId || msgs.length === 0) return;

    const unseenMessageIds: string[] = [];

    for (const msg of msgs) {
      // Skip own messages and temporary optimistic messages
      if (msg.isMine || msg.senderId === userId || msg.id.startsWith("temp-")) {
        continue;
      }

      // Check if we have already marked it in this session
      if (markedSeenIdsRef.current.has(msg.id)) {
        continue;
      }

      // Check if already seen according to DB reads
      const alreadySeen = msg.reads?.some((r) => r.userId === userId);
      if (alreadySeen) {
        markedSeenIdsRef.current.add(msg.id);
        continue;
      }

      unseenMessageIds.push(msg.id);
    }

    if (unseenMessageIds.length > 0) {
      unseenMessageIds.forEach((id) => markedSeenIdsRef.current.add(id));
      await markMessagesAsSeen(unseenMessageIds, userId);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await getGroupMessages(outingId);
      setMessages(msgs);

      // Mark group chat messages as read for this user
      if (currentUserId) {
        setGroupChatLastRead(currentUserId, outingId);
        queryClient.invalidateQueries({ queryKey: ["group-chats"] });
        markUnseenMessages(msgs, currentUserId);
      }
    } catch (err) {
      console.error("Error loading group messages:", err);
    }
  }, [outingId, currentUserId, queryClient, markUnseenMessages]);

  const loadChat = useCallback(async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      if (!user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      // Check authorization (host or joined participant)
      const allowed = await canAccessGroupChat(outingId);

      if (!allowed) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);
      setCurrentUserId(user.id);

      // Fetch user profile for optimistic messages
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setCurrentUserProfile({
          fullName: profile.full_name || "You",
          avatarUrl: profile.avatar_url,
        });
      }

      // Fetch Outing details
      const { data: outing } = await supabase
        .from("outings")
        .select("id, title, cover_image, host_id")
        .eq("id", outingId)
        .single();

      if (outing) {
        setOutingTitle(outing.title);
        setOutingImage(outing.cover_image);
      }

      // Fetch joined participant count (+1 for host)
      const { count } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("outing_id", outingId)
        .eq("status", "joined");

      setParticipantCount((count ?? 0) + 1);

      // Mark read and load messages immediately
      setGroupChatLastRead(user.id, outingId);
      queryClient.invalidateQueries({ queryKey: ["group-chats"] });

      const msgs = await getGroupMessages(outingId);
      setMessages(msgs);
      markUnseenMessages(msgs, user.id);

      // Ensure group conversation exists asynchronously
      ensureOutingGroup(outingId).then((groupRes) => {
        if (groupRes?.id) {
          setGroupId(groupRes.id);
        }
      });
    } catch (err: any) {
      console.error("[loadChat] Error:", err);
      toast.error(err.message || "Failed to load group chat");
    } finally {
      setLoading(false);
    }
  }, [outingId, navigate, queryClient, markUnseenMessages]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  // Real-time subscriptions for new group messages & read receipts
  useEffect(() => {
    if (!currentUserId || !authorized) return;

    const messageChannel = subscribeGroupMessages(outingId, () => {
      loadMessages();
    });

    const readChannel = subscribeGroupMessageReads(outingId, () => {
      loadMessages();
    });

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(readChannel);
    };
  }, [outingId, currentUserId, authorized, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!currentUserId || !trimmed) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      outingId,
      groupId: groupId || null,
      senderId: currentUserId,
      receiverId: null,
      message: trimmed,
      createdAt: new Date().toISOString(),
      isMine: true,
      senderName: currentUserProfile?.fullName || "You",
      senderAvatar: currentUserProfile?.avatarUrl || null,
    };

    // 1. Instantly display in UI
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 2. Perform DB insert
      const inserted = await sendGroupMessage(
        outingId,
        groupId || undefined,
        currentUserId,
        trimmed,
      );

      // 3. Update optimistic message with real DB row
      if (inserted) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: inserted.id,
                  createdAt: inserted.created_at || m.createdAt,
                  groupId: inserted.group_id || m.groupId,
                }
              : m,
          ),
        );
      }

      // 4. Update read indicator and chat list cache
      setGroupChatLastRead(currentUserId, outingId);
      queryClient.invalidateQueries({ queryKey: ["group-chats"] });
    } catch (err: any) {
      console.error("[handleSend] Error sending group message:", err);
      // Revert optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error(err.message || "Failed to send message. Please check connection.");
    }
  }

  async function handleDeleteMessage(messageId: string) {
    if (!currentUserId || !messageId) return;

    // 1. Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, message: "This message was deleted" } : m)),
    );

    try {
      await deleteGroupMessage(messageId, currentUserId);
      toast.success("Message deleted");
    } catch (err: any) {
      console.error("[handleDeleteMessage] Error deleting message:", err);
      toast.error(err.message || "Failed to delete message");
      loadMessages();
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading group chat...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center px-6 text-center bg-background text-foreground">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Chat Restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          You can only access this group chat once your join request has been accepted by the host.
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

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-background text-foreground overflow-hidden">
      <ChatHeader
        title={outingTitle || "Outing Group"}
        image={outingImage}
        participants={participantCount}
        onBack={() =>
          navigate({
            to: "/chats",
          })
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 overscroll-contain">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <p className="text-sm font-medium">No messages in this group yet.</p>
            <p className="text-xs mt-1">Send a message to start planning with the group!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const nextMessage = messages[index + 1];
            const prevMessage = messages[index - 1];

            // Grouping by actual senderId (not display name)
            const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId;
            const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;

            return (
              <GroupMessageBubble
                key={message.id}
                message={message}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                onDelete={handleDeleteMessage}
              />
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-white/10 bg-surface/95 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-xl">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
