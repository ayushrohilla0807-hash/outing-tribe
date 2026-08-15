import { supabase } from "@/integrations/supabase/client";
import type { Notification, NotificationType } from "../models/notification";

export async function getNotifications(): Promise<Notification[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const notifications: Notification[] = [];

  // 1. Pending join requests for outings the current user hosts
  const { data: pendingRequests } = await supabase
    .from("participants")
    .select(
      `
      id,
      joined_at,
      profiles:user_id (
        full_name
      ),
      outings:outing_id (
        id,
        title,
        host_id
      )
    `,
    )
    .eq("status", "pending")
    .order("joined_at", { ascending: false });

  if (pendingRequests) {
    for (const req of pendingRequests) {
      const outing = req.outings as any;
      const profile = req.profiles as any;

      if (outing?.host_id !== user.id) continue;

      const relTime = getRelativeTime(req.joined_at);
      notifications.push({
        id: `req-${req.id}`,
        title: "New Join Request",
        description: `${profile?.full_name || "Someone"} wants to join "${outing.title}".`,
        time: relTime,
        read: false,
        type: "join_request",
      });
    }
  }

  // 2. Status updates for current user's join requests (accepted/rejected)
  const { data: myRequests } = await supabase
    .from("participants")
    .select(
      `
      id,
      status,
      joined_at,
      outings:outing_id (
        id,
        title
      )
    `,
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(10);

  if (myRequests) {
    for (const req of myRequests) {
      const outing = req.outings as any;
      if (!outing) continue;

      const relTime = getRelativeTime(req.joined_at);

      if (req.status === "joined") {
        notifications.push({
          id: `joined-${req.id}`,
          title: "Request Accepted! 🎉",
          description: `You're now a member of "${outing.title}". Open the chat!`,
          time: relTime,
          read: false,
          type: "accepted",
        });
      } else if (req.status === "pending") {
        notifications.push({
          id: `pending-${req.id}`,
          title: "Join Request Pending",
          description: `Your request to join "${outing.title}" is awaiting approval.`,
          time: relTime,
          read: true,
          type: "join_request",
        });
      }
    }
  }

  // Deduplicate and sort unread first
  const seen = new Set<string>();
  const unique = notifications.filter((n) => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });

  return unique.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1));
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
