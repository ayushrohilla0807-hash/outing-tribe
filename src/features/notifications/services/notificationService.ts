import { supabase } from "@/integrations/supabase/client";
import type { Notification } from "../models/notification";

export async function getNotifications(): Promise<Notification[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const notifications: Notification[] = [];

  // 1. Pending join requests for outings the current user hosts
  // First fetch outings hosted by user
  const { data: hostedOutings } = await supabase
    .from("outings")
    .select("id, title")
    .eq("host_id", user.id);

  const hostedMap = new Map((hostedOutings ?? []).map((o) => [o.id, o.title]));
  const hostedIds = Array.from(hostedMap.keys());

  if (hostedIds.length > 0) {
    const { data: pendingRequests } = await supabase
      .from("participants")
      .select("id, outing_id, user_id, joined_at")
      .in("outing_id", hostedIds)
      .eq("status", "pending")
      .order("joined_at", { ascending: false });

    if (pendingRequests && pendingRequests.length > 0) {
      const requesterIds = Array.from(new Set(pendingRequests.map((p) => p.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", requesterIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "Someone"]));

      for (const req of pendingRequests) {
        const outingTitle = hostedMap.get(req.outing_id) || "Outing";
        const requesterName = profileMap.get(req.user_id) || "Someone";
        const relTime = getRelativeTime(req.joined_at);

        notifications.push({
          id: `req-${req.id}`,
          title: "New Join Request",
          description: `${requesterName} wants to join "${outingTitle}".`,
          time: relTime,
          read: false,
          type: "join_request",
        });
      }
    }
  }

  // 2. Status updates for current user's join requests (accepted/rejected)
  const { data: myRequests } = await supabase
    .from("participants")
    .select("id, outing_id, status, joined_at")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(15);

  if (myRequests && myRequests.length > 0) {
    const myOutingIds = Array.from(new Set(myRequests.map((r) => r.outing_id)));
    const { data: requestedOutings } = await supabase
      .from("outings")
      .select("id, title")
      .in("id", myOutingIds);

    const outingMap = new Map((requestedOutings ?? []).map((o) => [o.id, o.title]));

    for (const req of myRequests) {
      const outingTitle = outingMap.get(req.outing_id) || "Outing";
      const relTime = getRelativeTime(req.joined_at);

      if (req.status === "joined") {
        notifications.push({
          id: `joined-${req.id}`,
          title: "Request Accepted! 🎉",
          description: `You're now a member of "${outingTitle}". Open the chat!`,
          time: relTime,
          read: false,
          type: "accepted",
        });
      } else if (req.status === "pending") {
        notifications.push({
          id: `pending-${req.id}`,
          title: "Join Request Pending",
          description: `Your request to join "${outingTitle}" is awaiting approval.`,
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
