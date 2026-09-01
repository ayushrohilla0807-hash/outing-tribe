import { supabase } from "@/integrations/supabase/client";
import type { GroupChat, GroupMember, Message } from "../models/message";

const CHAT_LAST_READ_KEY_PREFIX = "outsy_chat_last_read_";

export function getChatLastReadMap(userId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(`${CHAT_LAST_READ_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setGroupChatLastRead(userId: string, outingId: string): void {
  try {
    const map = getChatLastReadMap(userId);
    map[`group_${outingId}`] = new Date().toISOString();
    localStorage.setItem(`${CHAT_LAST_READ_KEY_PREFIX}${userId}`, JSON.stringify(map));
  } catch (err) {
    console.error("Error setting group chat last read:", err);
  }
}

/**
 * Idempotently ensures that an outing has exactly ONE group conversation
 * and that the host and all joined participants are added as members.
 */
export async function ensureOutingGroup(
  outingId: string,
  hostId?: string,
): Promise<{ id: string; outing_id: string } | null> {
  try {
    // 1. Check if group conversation already exists
    const { data: existingGroup } = await supabase
      .from("group_conversations")
      .select("id, outing_id")
      .eq("outing_id", outingId)
      .maybeSingle();

    let groupId = existingGroup?.id;

    // 2. If not found, create it (safe against concurrent creation)
    if (!groupId) {
      const { data: newGroup, error: insertError } = await supabase
        .from("group_conversations")
        .insert({ outing_id: outingId })
        .select("id, outing_id")
        .maybeSingle();

      if (insertError) {
        // If insert errored due to unique constraint / race condition, re-fetch
        const { data: refetched } = await supabase
          .from("group_conversations")
          .select("id, outing_id")
          .eq("outing_id", outingId)
          .maybeSingle();
        groupId = refetched?.id;
      } else {
        groupId = newGroup?.id;
      }
    }

    if (!groupId) {
      return null;
    }

    // 3. Ensure host is registered in group_members
    let resolvedHostId = hostId;
    if (!resolvedHostId) {
      const { data: outing } = await supabase
        .from("outings")
        .select("host_id")
        .eq("id", outingId)
        .maybeSingle();
      resolvedHostId = outing?.host_id;
    }

    if (resolvedHostId) {
      await supabase
        .from("group_members")
        .upsert(
          {
            group_id: groupId,
            user_id: resolvedHostId,
            role: "host",
          },
          { onConflict: "group_id,user_id", ignoreDuplicates: true },
        );
    }

    // 4. Ensure all currently joined participants are in group_members
    const { data: joinedParticipants } = await supabase
      .from("participants")
      .select("user_id")
      .eq("outing_id", outingId)
      .eq("status", "joined");

    if (joinedParticipants && joinedParticipants.length > 0) {
      const membersToInsert = joinedParticipants.map((p) => ({
        group_id: groupId!,
        user_id: p.user_id,
        role: "member" as const,
      }));

      await supabase
        .from("group_members")
        .upsert(membersToInsert, { onConflict: "group_id,user_id", ignoreDuplicates: true });
    }

    return { id: groupId, outing_id: outingId };
  } catch (error) {
    console.error("[ensureOutingGroup] Error:", error);
    return null;
  }
}

/**
 * Checks whether the current user is authorized to access the outing group chat.
 * Allowed ONLY if host or accepted participant (status === 'joined').
 */
export async function canAccessGroupChat(outingId: string): Promise<boolean> {
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

/**
 * Fetch all outing group chats for the current user.
 */
export async function getOutingGroupChats(): Promise<GroupChat[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // 1. Get outings hosted by user
  const { data: hostedOutings } = await supabase
    .from("outings")
    .select("id, title, cover_image, host_id, created_at")
    .eq("host_id", user.id);

  // 2. Get outings where user is an accepted ('joined') participant
  const { data: participations } = await supabase
    .from("participants")
    .select("outing_id")
    .eq("user_id", user.id)
    .eq("status", "joined");

  const joinedOutingIds = (participations ?? []).map((p) => p.outing_id);

  let joinedOutings: any[] = [];
  if (joinedOutingIds.length > 0) {
    const { data: jOutings } = await supabase
      .from("outings")
      .select("id, title, cover_image, host_id, created_at")
      .in("id", joinedOutingIds);
    joinedOutings = jOutings ?? [];
  }

  // Combine and deduplicate outings
  const outingMap = new Map<
    string,
    { id: string; title: string; cover_image: string | null; host_id: string; created_at: string | null }
  >();

  for (const o of hostedOutings ?? []) {
    outingMap.set(o.id, o);
  }
  for (const o of joinedOutings) {
    outingMap.set(o.id, o);
  }

  const allOutings = Array.from(outingMap.values());
  if (allOutings.length === 0) return [];

  const allOutingIds = allOutings.map((o) => o.id);

  // 3. Ensure group conversations exist for all these outings
  const { data: existingGroups } = await supabase
    .from("group_conversations")
    .select("id, outing_id")
    .in("outing_id", allOutingIds);

  const groupConversationMap = new Map<string, string>();
  for (const g of existingGroups ?? []) {
    groupConversationMap.set(g.outing_id, g.id);
  }

  // For any outing without a group, lazily ensure it
  await Promise.all(
    allOutings.map(async (o) => {
      if (!groupConversationMap.has(o.id)) {
        const res = await ensureOutingGroup(o.id, o.host_id);
        if (res) {
          groupConversationMap.set(o.id, res.id);
        }
      }
    }),
  );

  // 4. Batch fetch participant counts for each outing
  const { data: participantRows } = await supabase
    .from("participants")
    .select("outing_id")
    .in("outing_id", allOutingIds)
    .eq("status", "joined");

  const participantCounts = new Map<string, number>();
  for (const p of participantRows ?? []) {
    participantCounts.set(p.outing_id, (participantCounts.get(p.outing_id) || 0) + 1);
  }

  const lastReadMap = getChatLastReadMap(user.id);

  // 5. Build GroupChat items with latest message and unread count
  const groupChats: GroupChat[] = await Promise.all(
    allOutings.map(async (outing) => {
      const groupId = groupConversationMap.get(outing.id);
      const isHost = outing.host_id === user.id;
      // Total count includes host + accepted participants
      const totalParticipants = (participantCounts.get(outing.id) || 0) + 1;

      // Fetch latest message for this outing
      const { data: latestMsgs } = await supabase
        .from("messages")
        .select("id, message, created_at, sender_id")
        .eq("outing_id", outing.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMsg = latestMsgs?.[0];

      // Fetch sender name if last message exists
      let senderName = "";
      if (lastMsg?.sender_id) {
        if (lastMsg.sender_id === user.id) {
          senderName = "You";
        } else {
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", lastMsg.sender_id)
            .maybeSingle();
          senderName = senderProfile?.full_name?.split(" ")[0] || "Member";
        }
      }

      // Count unread group messages
      const conversationKey = `group_${outing.id}`;
      const lastReadIso = lastReadMap[conversationKey];

      let unreadQuery = supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("outing_id", outing.id)
        .neq("sender_id", user.id);

      if (lastReadIso) {
        unreadQuery = unreadQuery.gt("created_at", lastReadIso);
      }

      const { count } = await unreadQuery;
      const unreadCount = count ?? 0;

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
        id: groupId || outing.id,
        outingId: outing.id,
        outingTitle: outing.title,
        outingImage: outing.cover_image,
        participantCount: totalParticipants,
        lastMessage: lastMessagePreview,
        lastMessageTime: formattedTime,
        lastMessageSenderName: senderName,
        unreadCount,
        isHost,
      };
    }),
  );

  return groupChats;
}

/**
 * Fetch messages for an outing group chat, including sender profile info.
 */
export async function getGroupMessages(
  outingId: string,
  _groupId?: string,
): Promise<Message[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: msgRows, error } = await supabase
    .from("messages")
    .select("*")
    .eq("outing_id", outingId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading group messages:", error);
    throw error;
  }

  if (!msgRows || msgRows.length === 0) return [];

  // Batch fetch sender profiles
  const senderIds = Array.from(new Set(msgRows.map((m) => m.sender_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", senderIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return msgRows.map((m) => {
    const profile = profileMap.get(m.sender_id);
    return {
      id: m.id,
      outingId: m.outing_id,
      groupId: m.group_id,
      senderId: m.sender_id,
      receiverId: null,
      message: m.message,
      createdAt: m.created_at ?? "",
      isMine: m.sender_id === user.id,
      senderName: profile?.full_name ?? "Member",
      senderAvatar: profile?.avatar_url ?? null,
    };
  });
}

/**
 * Send a message to an outing group chat.
 */
export async function sendGroupMessage(
  outingId: string,
  groupId: string | undefined | null,
  senderId: string,
  text: string,
) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Cannot send empty message");

  const payload: any = {
    outing_id: outingId,
    sender_id: senderId,
    message: trimmed,
  };

  if (groupId) {
    payload.group_id = groupId;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[sendGroupMessage] Supabase error:", error);
    throw new Error(error.message || `Failed to send message: ${error.code || "unknown error"}`);
  }

  return data;
}

/**
 * Subscribe to real-time messages for an outing group.
 */
export function subscribeGroupMessages(
  outingId: string,
  callback: (payload: any) => void,
) {
  return supabase
    .channel(`group-chat-${outingId}`)
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

/**
 * Get all members of an outing group (Host + Joined participants)
 */
export async function getGroupMembers(outingId: string): Promise<GroupMember[]> {
  const { data: outing } = await supabase
    .from("outings")
    .select("id, host_id, created_at")
    .eq("id", outingId)
    .maybeSingle();

  if (!outing) return [];

  const { data: joinedParticipants } = await supabase
    .from("participants")
    .select("id, user_id, joined_at")
    .eq("outing_id", outingId)
    .eq("status", "joined");

  const userIds: string[] = [];
  if (outing.host_id) userIds.push(outing.host_id);
  for (const p of joinedParticipants ?? []) {
    if (!userIds.includes(p.user_id)) {
      userIds.push(p.user_id);
    }
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const members: GroupMember[] = [];

  // Add host first
  if (outing.host_id) {
    const hostProfile = profileMap.get(outing.host_id);
    members.push({
      id: `host-${outing.host_id}`,
      userId: outing.host_id,
      fullName: hostProfile?.full_name ?? "Host",
      avatarUrl: hostProfile?.avatar_url ?? null,
      role: "host",
      joinedAt: outing.created_at ?? "",
    });
  }

  // Add joined participants
  for (const p of joinedParticipants ?? []) {
    if (p.user_id === outing.host_id) continue;
    const pProfile = profileMap.get(p.user_id);
    members.push({
      id: p.id,
      userId: p.user_id,
      fullName: pProfile?.full_name ?? "Member",
      avatarUrl: pProfile?.avatar_url ?? null,
      role: "member",
      joinedAt: p.joined_at ?? "",
    });
  }

  return members;
}
