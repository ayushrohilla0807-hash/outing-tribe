import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { getOutingGroupChats } from "./services/groupChatService";
import GroupChatCard from "./widgets/GroupChatCard";
import EmptyState from "./widgets/EmptyState";

export default function ChatListScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: groupChats = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["group-chats"],
    queryFn: getOutingGroupChats,
  });

  useEffect(() => {
    // Listen for new messages, group memberships & participant updates to keep list reactive
    const channel = supabase
      .channel("chat-list-realtime-groups")
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

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-28">
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
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-28">
        <h1 className="mb-6 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Chats
        </h1>
        <p className="text-sm text-destructive">Failed to load chats. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-28">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Chats</h1>
        {groupChats.length > 0 && (
          <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
            {groupChats.length} outing{groupChats.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {groupChats.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="w-full space-y-3.5">
          {groupChats.map((group) => (
            <GroupChatCard
              key={`group-${group.outingId}`}
              chat={group}
              onClick={() =>
                navigate({
                  to: "/chats/$outingId/group",
                  params: {
                    outingId: group.outingId,
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
