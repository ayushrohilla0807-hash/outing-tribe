import { supabase } from "@/integrations/supabase/client";
import type { Chat } from "../models/message";

export interface ChatMessage {
  id: string;
  outing_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getMessages(
  outingId: string,
  currentUserId: string,
  otherUserId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("outing_id", outingId)
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`,
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading messages:", error);
    throw error;
  }

  return (data as ChatMessage[]) ?? [];
}

export async function sendMessage(
  outingId: string,
  senderId: string,
  receiverId: string,
  text: string,
) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const { error } = await supabase.from("messages").insert({
    outing_id: outingId,
    sender_id: senderId,
    receiver_id: receiverId,
    message: trimmed,
  });

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export function subscribeMessages(outingId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`chat-room-${outingId}-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `outing_id=eq.${outingId}`,
      },
      callback,
    )
    .subscribe();
}

export async function canAccessChat(outingId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 1. Host check
  const { data: outing } = await supabase
    .from("outings")
    .select("host_id")
    .eq("id", outingId)
    .maybeSingle();

  if (outing?.host_id === user.id) {
    return true;
  }

  // 2. Joined participant check
  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("outing_id", outingId)
    .eq("user_id", user.id)
    .eq("status", "joined")
    .maybeSingle();

  return !!participant;
}

const CHAT_LAST_READ_KEY_PREFIX = "outsy_chat_last_read_";

export function getChatLastReadMap(userId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(`${CHAT_LAST_READ_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setChatLastRead(userId: string, outingId: string, otherUserId: string): void {
  try {
    const map = getChatLastReadMap(userId);
    map[`${outingId}_${otherUserId}`] = new Date().toISOString();
    localStorage.setItem(`${CHAT_LAST_READ_KEY_PREFIX}${userId}`, JSON.stringify(map));
  } catch (err) {
    console.error("Error setting chat last read:", err);
  }
}

export async function getAcceptedChats(): Promise<Chat[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  interface ChatTarget {
    outingId: string;
    otherUserId: string;
    outingName: string;
    outingImage: string | null;
  }

  const targets: ChatTarget[] = [];
  const seenKeys = new Set<string>();

  // 1. As Participant: Find outings where current user is 'joined' (chat with Host)
  const { data: participations, error: partErr } = await supabase
    .from("participants")
    .select("outing_id")
    .eq("user_id", user.id)
    .eq("status", "joined");

  if (partErr) {
    console.error("Error loading user participations:", partErr);
  }

  const joinedOutingIds = (participations ?? []).map((p) => p.outing_id);

  if (joinedOutingIds.length > 0) {
    const { data: outingsData } = await supabase
      .from("outings")
      .select("id, title, cover_image, host_id")
      .in("id", joinedOutingIds);

    for (const outing of outingsData ?? []) {
      if (!outing.host_id || outing.host_id === user.id) continue;
      const key = `${outing.id}-${outing.host_id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        targets.push({
          outingId: outing.id,
          otherUserId: outing.host_id,
          outingName: outing.title,
          outingImage: outing.cover_image,
        });
      }
    }
  }

  // 2. As Host: Find outings created by user, and all 'joined' participants
  const { data: hostedOutings, error: hostErr } = await supabase
    .from("outings")
    .select("id, title, cover_image")
    .eq("host_id", user.id);

  if (hostErr) {
    console.error("Error loading hosted outings:", hostErr);
  }

  const hostedOutingMap = new Map<string, { title: string; cover_image: string | null }>();
  for (const h of hostedOutings ?? []) {
    hostedOutingMap.set(h.id, { title: h.title, cover_image: h.cover_image });
  }

  const hostedIds = Array.from(hostedOutingMap.keys());
  if (hostedIds.length > 0) {
    const { data: hostParticipants } = await supabase
      .from("participants")
      .select("outing_id, user_id")
      .in("outing_id", hostedIds)
      .eq("status", "joined");

    for (const p of hostParticipants ?? []) {
      if (!p.user_id || p.user_id === user.id) continue;
      const outingInfo = hostedOutingMap.get(p.outing_id);
      if (!outingInfo) continue;

      const key = `${p.outing_id}-${p.user_id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        targets.push({
          outingId: p.outing_id,
          otherUserId: p.user_id,
          outingName: outingInfo.title,
          outingImage: outingInfo.cover_image,
        });
      }
    }
  }

  if (targets.length === 0) {
    return [];
  }

  // 3. Batch fetch other users' profiles
  const uniqueOtherUserIds = Array.from(new Set(targets.map((t) => t.otherUserId)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", uniqueOtherUserIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      { fullName: p.full_name ?? "Participant", avatarUrl: p.avatar_url ?? null },
    ]),
  );

  const lastReadMap = getChatLastReadMap(user.id);

  // 4. Fetch latest message and count for each conversation
  const chatList: Chat[] = await Promise.all(
    targets.map(async (t) => {
      const profile = profileMap.get(t.otherUserId);
      const conversationKey = `${t.outingId}_${t.otherUserId}`;
      const lastReadIso = lastReadMap[conversationKey];

      const { data: latestMsgs } = await supabase
        .from("messages")
        .select("message, created_at")
        .eq("outing_id", t.outingId)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${t.otherUserId}),and(sender_id.eq.${t.otherUserId},receiver_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: false })
        .limit(1);

      // Count unread incoming messages sent by otherUser to currentUser after lastReadIso
      let unreadCount = 0;
      if (lastReadIso) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("outing_id", t.outingId)
          .eq("sender_id", t.otherUserId)
          .eq("receiver_id", user.id)
          .gt("created_at", lastReadIso);
        unreadCount = count ?? 0;
      } else {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("outing_id", t.outingId)
          .eq("sender_id", t.otherUserId)
          .eq("receiver_id", user.id);
        unreadCount = count ?? 0;
      }

      const lastMsg = latestMsgs?.[0];

      let formattedTime = "";
      if (lastMsg?.created_at) {
        const d = new Date(lastMsg.created_at);
        formattedTime = d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      let lastMessagePreview = lastMsg?.message || "";
      if (lastMessagePreview.startsWith("[image:")) {
        const afterTag = lastMessagePreview.replace(/^\[image:[^\]]+\]\s*/, "");
        lastMessagePreview = afterTag ? `📷 ${afterTag}` : "📷 Photo";
      } else if (lastMessagePreview.startsWith("[file:")) {
        const afterTag = lastMessagePreview.replace(/^\[file:[^\]]+\]\s*/, "");
        lastMessagePreview = afterTag ? `📎 ${afterTag}` : "📎 Attachment";
      }

      return {
        outingId: t.outingId,
        otherUserId: t.otherUserId,
        outingName: t.outingName,
        outingImage: t.outingImage,
        otherUserName: profile?.fullName ?? "Participant",
        otherUserAvatar: profile?.avatarUrl ?? null,
        lastMessage: lastMessagePreview,
        lastMessageTime: formattedTime,
        unreadCount,
        participants: 2,
      };
    }),
  );

  return chatList;
}
