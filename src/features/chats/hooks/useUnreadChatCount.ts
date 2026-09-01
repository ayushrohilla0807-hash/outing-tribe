import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getOutingGroupChats } from "../services/groupChatService";

export function useUnreadChatCount() {
  const queryClient = useQueryClient();

  const { data: groupChats = [] } = useQuery({
    queryKey: ["group-chats"],
    queryFn: getOutingGroupChats,
    staleTime: 1000 * 15,
  });

  useEffect(() => {
    const channel = supabase
      .channel("unread-group-chats-realtime-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        queryClient.invalidateQueries({ queryKey: ["group-chats"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
        queryClient.invalidateQueries({ queryKey: ["group-chats"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "group_members" }, () => {
        queryClient.invalidateQueries({ queryKey: ["group-chats"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unreadChatCount = groupChats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);

  return { unreadChatCount, groupChats };
}
