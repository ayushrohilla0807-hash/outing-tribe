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
import ParticipantsDrawer from "./widgets/ParticipantsDrawer";

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
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);

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

  function getNormalizedSenderId(msg?: Message | null): string {
    if (!msg) return "";
    const id = msg.senderId || (msg as any).sender_id || "";
    return String(id).trim().toLowerCase();
  }

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await getGroupMessages(outingId);
      setMessages((prev) => {
        const tempMsgs = prev.filter((m) => m.id.startsWith("temp-"));
        if (tempMsgs.length === 0) return msgs;

        const remainingTemps = tempMsgs.filter(
          (temp) =>
            !msgs.some(
              (m) =>
                getNormalizedSenderId(m) === getNormalizedSenderId(temp) &&
                m.message === temp.message,
            ),
        );
        return [...msgs, ...remainingTemps];
      });

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

  function isSameDay(d1: string, d2: string) {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  function formatDateDivider(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return "Today";
    }
    if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return "Yesterday";
    }
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="relative flex h-full w-full flex-1 flex-col bg-background text-foreground overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 select-none">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <ChatHeader
        title={outingTitle || "Outing Group"}
        image={outingImage}
        participants={participantCount}
        outingId={outingId}
        onParticipantsClick={() => setParticipantsDrawerOpen(true)}
        onBack={() =>
          navigate({
            to: "/chats",
          })
        }
      />

      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 overscroll-contain space-y-1">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-3 shadow-inner">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-base font-bold text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Say hello and start planning the outing with your tribe!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const nextMessage = messages[index + 1];
            const prevMessage = messages[index - 1];

            const showDateDivider =
              !prevMessage || !isSameDay(prevMessage.createdAt, message.createdAt);

            const currentSender = getNormalizedSenderId(message);
            const prevSender = getNormalizedSenderId(prevMessage);
            const nextSender = getNormalizedSenderId(nextMessage);

            // Grouping strictly by consecutive sender identity on the same calendar day
            const isFirstInGroup = showDateDivider || !prevMessage || prevSender !== currentSender;
            const isLastInGroup =
              !nextMessage ||
              !isSameDay(message.createdAt, nextMessage.createdAt) ||
              nextSender !== currentSender;
            const isLatestInChat = index === messages.length - 1;

            return (
              <div key={message.id} className="w-full">
                {showDateDivider && (
                  <div className="my-3.5 flex items-center justify-center">
                    <span className="rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-3.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                      {formatDateDivider(message.createdAt)}
                    </span>
                  </div>
                )}
                <GroupMessageBubble
                  message={message}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                  isLatestInChat={isLatestInChat}
                  onDelete={handleDeleteMessage}
                />
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <div className="relative z-10 shrink-0 border-t border-white/10 bg-background/80 p-2.5 sm:p-3 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] backdrop-blur-2xl">
        <ChatInput onSend={handleSend} />
      </div>

      {/* Outing Participants Drawer */}
      <ParticipantsDrawer
        open={participantsDrawerOpen}
        onClose={() => setParticipantsDrawerOpen(false)}
        outingId={outingId}
        outingTitle={outingTitle}
        currentUserId={currentUserId}
      />
    </div>
  );
}
