import { supabase } from "@/integrations/supabase/client";
import type { Notification } from "../models/notification";

const READ_STORAGE_KEY_PREFIX = "outsy_read_notifications_";
const CLEARED_STORAGE_KEY_PREFIX = "outsy_cleared_notifications_";
const CLEARED_TIMESTAMP_KEY_PREFIX = "outsy_cleared_notifications_timestamp_";

export function getReadNotificationIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${READ_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(userId: string, notificationId: string): void {
  try {
    const readIds = getReadNotificationIds(userId);
    if (!readIds.includes(notificationId)) {
      readIds.push(notificationId);
      localStorage.setItem(`${READ_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(readIds));
    }
  } catch (err) {
    console.error("Error saving read notification:", err);
  }
}

export function markAllNotificationsAsRead(userId: string, notificationIds: string[]): void {
  try {
    const existing = getReadNotificationIds(userId);
    const updated = Array.from(new Set([...existing, ...notificationIds]));
    localStorage.setItem(`${READ_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.error("Error saving all read notifications:", err);
  }
}

export function getClearedNotificationIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${CLEARED_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getClearedTimestamp(userId: string): string | null {
  try {
    return localStorage.getItem(`${CLEARED_TIMESTAMP_KEY_PREFIX}${userId}`);
  } catch {
    return null;
  }
}

export function clearAllNotifications(userId: string, notificationIds: string[]): void {
  try {
    const existing = getClearedNotificationIds(userId);
    const updated = Array.from(new Set([...existing, ...notificationIds]));
    localStorage.setItem(`${CLEARED_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
    localStorage.setItem(`${CLEARED_TIMESTAMP_KEY_PREFIX}${userId}`, new Date().toISOString());
  } catch (err) {
    console.error("Error clearing notifications:", err);
  }
}

export async function getNotifications(): Promise<Notification[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const readIds = new Set(getReadNotificationIds(user.id));
  const clearedIds = new Set(getClearedNotificationIds(user.id));
  const clearedTimestamp = getClearedTimestamp(user.id);
  const clearedTime = clearedTimestamp ? new Date(clearedTimestamp).getTime() : 0;
  const notifications: Notification[] = [];

  // 1. Join requests (both pending and accepted) for outings the current user hosts
  const { data: hostedOutings } = await supabase
    .from("outings")
    .select("id, title, host_id, created_at")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  const hostedMap = new Map((hostedOutings ?? []).map((o) => [o.id, o.title]));
  const hostedIds = Array.from(hostedMap.keys());

  if (hostedIds.length > 0) {
    const { data: hostRequests } = await supabase
      .from("participants")
      .select("id, outing_id, user_id, status, joined_at")
      .in("outing_id", hostedIds)
      .order("joined_at", { ascending: false });

    if (hostRequests && hostRequests.length > 0) {
      const requesterIds = Array.from(
        new Set(hostRequests.filter((p) => p.user_id !== user.id).map((p) => p.user_id)),
      );

      let profileMap = new Map<string, string>();
      if (requesterIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", requesterIds);

        profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "Someone"]));
      }

      for (const req of hostRequests) {
        if (req.user_id === user.id) continue;
        const outingTitle = hostedMap.get(req.outing_id) || "Outing";
        const personName = profileMap.get(req.user_id) || "Someone";
        const isoTime = req.joined_at || new Date().toISOString();
        const relTime = getRelativeTime(isoTime);

        if (req.status === "pending") {
          const notifId = `host-pending-${req.id}`;
          notifications.push({
            id: notifId,
            title: "New Join Request",
            description: `${personName} requested to join "${outingTitle}". Review and accept them on your dashboard.`,
            timestamp: isoTime,
            time: relTime,
            read: readIds.has(notifId),
            type: "join_request",
            outingId: req.outing_id,
            link: "/host-dashboard",
          });
        } else if (req.status === "joined") {
          const notifId = `host-joined-${req.id}`;
          notifications.push({
            id: notifId,
            title: "Member Joined",
            description: `${personName} is confirmed as a member for "${outingTitle}".`,
            timestamp: isoTime,
            time: relTime,
            read: readIds.has(notifId),
            type: "accepted",
            outingId: req.outing_id,
            link: "/host-dashboard",
          });
        }
      }
    }
  }

  // 2. Status updates for the current user's join requests
  const { data: myRequests } = await supabase
    .from("participants")
    .select("id, outing_id, status, joined_at")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (myRequests && myRequests.length > 0) {
    const myOutingIds = Array.from(new Set(myRequests.map((r) => r.outing_id)));
    const { data: requestedOutings } = await supabase
      .from("outings")
      .select("id, title, host_id")
      .in("id", myOutingIds);

    const outingMap = new Map(
      (requestedOutings ?? []).map((o) => [o.id, { title: o.title, hostId: o.host_id }]),
    );

    for (const req of myRequests) {
      const outingInfo = outingMap.get(req.outing_id);
      const outingTitle = outingInfo?.title || "Outing";
      const hostId = outingInfo?.hostId;
      const isoTime = req.joined_at || new Date().toISOString();
      const relTime = getRelativeTime(isoTime);

      if (req.status === "joined") {
        const notifId = `user-joined-${req.id}`;
        notifications.push({
          id: notifId,
          title: "Request Accepted! 🎉",
          description: `You're now a member of "${outingTitle}". Open the chat to connect with the host.`,
          timestamp: isoTime,
          time: relTime,
          read: readIds.has(notifId),
          type: "accepted",
          outingId: req.outing_id,
          link: hostId ? `/chats/${req.outing_id}/${hostId}` : `/chats`,
        });
      } else if (req.status === "pending") {
        const notifId = `user-pending-${req.id}`;
        notifications.push({
          id: notifId,
          title: "Join Request Sent",
          description: `Your request to join "${outingTitle}" is awaiting host approval.`,
          timestamp: isoTime,
          time: relTime,
          read: readIds.has(notifId),
          type: "join_request",
          outingId: req.outing_id,
          link: `/outing/${req.outing_id}`,
        });
      }
    }
  }

  // 3. Outings created by the current user
  if (hostedOutings && hostedOutings.length > 0) {
    for (const outing of hostedOutings) {
      const notifId = `user-created-${outing.id}`;
      const isoTime = outing.created_at || new Date().toISOString();
      notifications.push({
        id: notifId,
        title: "Outing Created",
        description: `Your outing "${outing.title}" is live. Look out for join requests!`,
        timestamp: isoTime,
        time: getRelativeTime(isoTime),
        read: readIds.has(notifId),
        type: "outing_created",
        outingId: outing.id,
        link: `/outing/${outing.id}`,
      });
    }
  }

  // Deduplicate and filter out cleared notifications
  const seen = new Set<string>();
  const active = notifications.filter((n) => {
    if (clearedIds.has(n.id)) return false;
    if (clearedTime && new Date(n.timestamp).getTime() <= clearedTime) return false;
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });

  // Sort newest first by timestamp
  return active.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function getRelativeTime(isoString: string | null): string {
  if (!isoString) return "";

  const now = new Date();
  const then = new Date(isoString);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
}
