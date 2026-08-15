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

export async function getAcceptedChats(): Promise<Chat[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const chatList: Chat[] = [];
  const seenKeys = new Set<string>();

  // 1. Outings where user is a joined participant (chat with Host)
  const { data: joinedParticipations, error: partError } = await supabase
    .from("participants")
    .select(
      `
      outing_id,
      outings (
        id,
        title,
        cover_image,
        host_id,
        profiles:host_id (
          id,
          full_name,
          avatar_url
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "joined");

  if (partError) {
    console.error("Error fetching participations for chats:", partError);
  }

  if (joinedParticipations) {
    for (const item of joinedParticipations) {
      const outing = item.outings as any;
      if (!outing) continue;

      const otherUserId = outing.host_id;
      if (!otherUserId || otherUserId === user.id) continue;

      const chatKey = `${outing.id}-${otherUserId}`;
      if (seenKeys.has(chatKey)) continue;
      seenKeys.add(chatKey);

      // Fetch latest message
      const { data: latestMsgs } = await supabase
        .from("messages")
        .select("*")
        .eq("outing_id", outing.id)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMsg = latestMsgs?.[0];

      // Format time
      let formattedTime = "";
      if (lastMsg?.created_at) {
        const d = new Date(lastMsg.created_at);
        formattedTime = d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      chatList.push({
        outingId: outing.id,
        otherUserId,
        outingName: outing.title,
        outingImage: outing.cover_image,
        otherUserName: outing.profiles?.full_name || "Host",
        otherUserAvatar: outing.profiles?.avatar_url || null,
        lastMessage: lastMsg?.message || "Say hello to start planning!",
        lastMessageTime: formattedTime,
        unreadCount: 0,
        participants: 2,
      });
    }
  }

  // 2. Outings where user is the Host (chat with each joined Participant)
  const { data: hostedOutings, error: hostError } = await supabase
    .from("outings")
    .select(
      `
      id,
      title,
      cover_image,
      participants (
        id,
        user_id,
        status,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      )
    `,
    )
    .eq("host_id", user.id);

  if (hostError) {
    console.error("Error fetching hosted chats:", hostError);
  }

  if (hostedOutings) {
    for (const outing of hostedOutings) {
      const participants = (outing.participants as any[]) || [];
      const joinedMembers = participants.filter((p) => p.status === "joined");

      for (const member of joinedMembers) {
        const otherUserId = member.user_id;
        if (!otherUserId || otherUserId === user.id) continue;

        const chatKey = `${outing.id}-${otherUserId}`;
        if (seenKeys.has(chatKey)) continue;
        seenKeys.add(chatKey);

        const { data: latestMsgs } = await supabase
          .from("messages")
          .select("*")
          .eq("outing_id", outing.id)
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`,
          )
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMsg = latestMsgs?.[0];

        let formattedTime = "";
        if (lastMsg?.created_at) {
          const d = new Date(lastMsg.created_at);
          formattedTime = d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        chatList.push({
          outingId: outing.id,
          otherUserId,
          outingName: outing.title,
          outingImage: outing.cover_image,
          otherUserName: member.profiles?.full_name || "Participant",
          otherUserAvatar: member.profiles?.avatar_url || null,
          lastMessage: lastMsg?.message || "Say hello to start planning!",
          lastMessageTime: formattedTime,
          unreadCount: 0,
          participants: 2,
        });
      }
    }
  }

  return chatList;
}
