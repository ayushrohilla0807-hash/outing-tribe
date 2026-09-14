import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, MessageSquarePlus, Sparkles, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { getOutingGroupChats, formatChatTimestamp } from "./services/groupChatService";
import type { GroupChat } from "./models/message";
import GroupChatCard from "./widgets/GroupChatCard";
import EmptyState from "./widgets/EmptyState";

type FilterType = "all" | "unread" | "hosted";

export default function ChatListScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const {
    data: groupChats = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["group-chats"],
    queryFn: getOutingGroupChats,
  });

  useEffect(() => {
    // Realtime subscription on messages to re-order instantly upon new messages
    const channel = supabase
      .channel("chat-list-realtime-sorting")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            outing_id: string;
            message: string;
            created_at: string;
            sender_id: string;
          };

          if (!newMsg || !newMsg.outing_id) return;

          // Optimistically update React Query cache to immediately move this outing to the TOP
          queryClient.setQueryData<GroupChat[]>(["group-chats"], (oldChats) => {
            if (!oldChats || oldChats.length === 0) return oldChats;

            const chatIndex = oldChats.findIndex((c) => c.outingId === newMsg.outing_id);
            if (chatIndex === -1) {
              queryClient.invalidateQueries({ queryKey: ["group-chats"] });
              return oldChats;
            }

            const targetChat = { ...oldChats[chatIndex] };

            let preview = newMsg.message || "";
            if (preview.startsWith("[image:")) {
              const afterTag = preview.replace(/^\[image:[^\]]+\]\s*/, "");
              preview = afterTag ? `📷 ${afterTag}` : "📷 Photo";
            } else if (preview.startsWith("[file:")) {
              const afterTag = preview.replace(/^\[file:[^\]]+\]\s*/, "");
              preview = afterTag ? `📎 ${afterTag}` : "📎 Attachment";
            }

            targetChat.lastMessage = preview;
            targetChat.lastMessageCreatedAt = newMsg.created_at;
            targetChat.lastMessageTime = formatChatTimestamp(newMsg.created_at);
            if (currentUserId && newMsg.sender_id !== currentUserId) {
              targetChat.unreadCount = (targetChat.unreadCount || 0) + 1;
            }

            const otherChats = oldChats.filter((_, idx) => idx !== chatIndex);
            return [targetChat, ...otherChats];
          });

          // Sync with database
          queryClient.invalidateQueries({ queryKey: ["group-chats"] });
        },
      )
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
  }, [queryClient, currentUserId]);

  // Filtered & searched chats
  const filteredChats = useMemo(() => {
    return groupChats.filter((chat) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = chat.outingTitle.toLowerCase().includes(query);
        const matchesMessage = chat.lastMessage.toLowerCase().includes(query);
        const matchesSender = (chat.lastMessageSenderName || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage && !matchesSender) return false;
      }

      // Tab filter
      if (filterType === "unread") {
        return chat.unreadCount > 0;
      }
      if (filterType === "hosted") {
        return chat.isHost;
      }

      return true;
    });
  }, [groupChats, searchQuery, filterType]);

  const totalUnreadCount = groupChats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

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
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-28 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Chats</h1>
          {totalUnreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow-glow animate-pulse">
              {totalUnreadCount} new
            </span>
          )}
        </div>

        {groupChats.length > 0 && (
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {groupChats.length} outing{groupChats.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {groupChats.length > 0 && (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer active:scale-95 ${
                filterType === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground"
              }`}
            >
              All ({groupChats.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType("unread")}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer active:scale-95 ${
                filterType === "unread"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground"
              }`}
            >
              Unread {totalUnreadCount > 0 && `(${totalUnreadCount})`}
            </button>

            <button
              type="button"
              onClick={() => setFilterType("hosted")}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer active:scale-95 ${
                filterType === "hosted"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground"
              }`}
            >
              Hosted ({groupChats.filter((c) => c.isHost).length})
            </button>
          </div>
        </>
      )}

      {/* Chat List */}
      {groupChats.length === 0 ? (
        <EmptyState />
      ) : filteredChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-sm font-semibold text-foreground">No conversations found</p>
          <p className="text-xs mt-1">Try searching with a different name or clear the filter</p>
        </div>
      ) : (
        <div className="w-full space-y-2.5">
          {filteredChats.map((group) => (
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
