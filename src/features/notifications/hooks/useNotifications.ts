import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "../services/notificationService";
import type { Notification } from "../models/notification";

export function useNotifications() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Listen for realtime updates from participants and outings
  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "outings" }, () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      markNotificationAsRead(user.id, notificationId);

      // Optimistically update query data
      queryClient.setQueryData<Notification[]>(["notifications"], (prev = []) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    },
    [queryClient],
  );

  const markAllAsRead = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const allIds = notifications.map((n) => n.id);
    markAllNotificationsAsRead(user.id, allIds);

    // Optimistically update query data
    queryClient.setQueryData<Notification[]>(["notifications"], (prev = []) =>
      prev.map((n) => ({ ...n, read: true })),
    );
  }, [notifications, queryClient]);

  const clearAll = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const allIds = notifications.map((n) => n.id);
    clearAllNotifications(user.id, allIds);

    // Optimistically clear query data
    queryClient.setQueryData<Notification[]>(["notifications"], []);
  }, [notifications, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    clearAll,
    refetch,
  };
}
