import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAcceptedChats } from "../services/chatService";

export function useUnreadChatCount() {
  const queryClient = useQueryClient();

  const { data: chats = [] } = useQuery({
    queryKey: ["accepted-chats"],
    queryFn: getAcceptedChats,
    staleTime: 1000 * 15,
  });

  useEffect(() => {
    const channel = supabase
      .channel("unread-chats-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        queryClient.invalidateQueries({ queryKey: ["accepted-chats"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
        queryClient.invalidateQueries({ queryKey: ["accepted-chats"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unreadChatCount = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);

  return { unreadChatCount, chats };
}
