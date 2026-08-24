import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { getAcceptedChats } from "./services/chatService";
import ChatCard from "./widgets/ChatCard";
import EmptyState from "./widgets/EmptyState";

export default function ChatListScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: chats = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["accepted-chats"],
    queryFn: getAcceptedChats,
  });

  useEffect(() => {
    // Listen for new messages & participant updates to keep chat list reactive
    const channel = supabase
      .channel("chat-list-realtime")
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

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8">
        <h1 className="mb-6 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Chats
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8">
        <h1 className="mb-6 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Chats
        </h1>
        <p className="text-sm text-destructive">Failed to load chats. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8">
      <h1 className="mb-6 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Chats</h1>

      {chats.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="w-full space-y-3.5">
          {chats.map((chat) => (
            <ChatCard
              key={`${chat.outingId}-${chat.otherUserId}`}
              chat={chat}
              onClick={() =>
                navigate({
                  to: "/chats/$outingId/$userId",
                  params: {
                    outingId: chat.outingId,
                    userId: chat.otherUserId,
                  },
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
