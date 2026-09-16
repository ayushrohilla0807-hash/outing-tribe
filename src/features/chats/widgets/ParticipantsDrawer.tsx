import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Users, Crown, ChevronRight, Search, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

interface ParticipantsDrawerProps {
  open: boolean;
  onClose: () => void;
  outingId: string;
  outingTitle?: string;
  currentUserId?: string;
}

export interface ChatParticipant {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: "host" | "member";
  city?: string;
  joinedAt?: string;
  isCurrentUser: boolean;
}

async function fetchChatParticipants(
  outingId: string,
  currentUserId?: string,
): Promise<ChatParticipant[]> {
  if (!outingId) return [];

  // 1. Fetch outing to identify host
  const { data: outing, error: outingError } = await supabase
    .from("outings")
    .select("id, host_id")
    .eq("id", outingId)
    .maybeSingle();

  if (outingError) {
    console.error("Error fetching outing host:", outingError);
  }

  const hostId = outing?.host_id;

  // 2. Fetch joined participants
  const { data: participantRows, error: participantError } = await supabase
    .from("participants")
    .select("id, user_id, joined_at, status")
    .eq("outing_id", outingId)
    .eq("status", "joined")
    .order("joined_at", { ascending: true });

  if (participantError) {
    console.error("Error fetching participants:", participantError);
  }

  // 3. Unique user IDs (Host + Joined Members)
  const allUserIds = Array.from(
    new Set([...(hostId ? [hostId] : []), ...(participantRows ?? []).map((p) => p.user_id)]),
  );

  if (allUserIds.length === 0) return [];

  // 4. Fetch profiles
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, city")
    .in("id", allUserIds);

  if (profileError) {
    console.error("Error fetching profiles for participants:", profileError);
  }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const result: ChatParticipant[] = [];

  // Add Host first
  if (hostId) {
    const hostProfile = profileMap.get(hostId);
    result.push({
      userId: hostId,
      name: hostProfile?.full_name || "Host",
      avatarUrl: hostProfile?.avatar_url || null,
      role: "host",
      city: hostProfile?.city,
      isCurrentUser: currentUserId === hostId,
    });
  }

  // Add confirmed joined members (skipping duplicate host if they joined their own outing row)
  for (const row of participantRows ?? []) {
    if (row.user_id === hostId) continue;
    const memberProfile = profileMap.get(row.user_id);
    result.push({
      userId: row.user_id,
      name: memberProfile?.full_name || "Member",
      avatarUrl: memberProfile?.avatar_url || null,
      role: "member",
      city: memberProfile?.city,
      joinedAt: row.joined_at,
      isCurrentUser: currentUserId === row.user_id,
    });
  }

  return result;
}

export default function ParticipantsDrawer({
  open,
  onClose,
  outingId,
  outingTitle,
  currentUserId,
}: ParticipantsDrawerProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: participants = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["outing-chat-participants", outingId],
    queryFn: () => fetchChatParticipants(outingId, currentUserId),
    enabled: open && !!outingId,
    staleTime: 1000 * 60, // 1 minute
  });

  const filteredParticipants = useMemo(() => {
    if (!search.trim()) return participants;
    const query = search.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(query) || (p.city && p.city.toLowerCase().includes(query)),
    );
  }, [participants, search]);

  const handleUserClick = (userId: string, isCurrentUser: boolean) => {
    onClose();
    if (isCurrentUser) {
      navigate({ to: "/profile" });
    } else {
      navigate({ to: `/profile/${userId}` });
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end pointer-events-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="participants-drawer-title"
        className="relative z-10 mx-auto flex w-full max-w-lg max-h-[85vh] max-h-[85dvh] flex-col rounded-t-3xl border-t border-white/15 bg-zinc-950 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl backdrop-blur-2xl transition-transform animate-in slide-in-from-bottom duration-250 ease-out text-foreground"
      >
        {/* Drag handle */}
        <div className="mb-3 flex justify-center shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-3.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="participants-drawer-title"
                  className="text-lg font-bold tracking-tight text-foreground truncate"
                >
                  Participants
                </h2>
                <span className="rounded-full bg-primary/15 border border-primary/25 px-2 py-0.5 text-xs font-semibold text-primary">
                  {participants.length}
                </span>
              </div>
              {outingTitle && (
                <p className="text-xs text-muted-foreground truncate">{outingTitle}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar (if more than 3 participants) */}
        {participants.length > 3 && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-8.5 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
            />
          </div>
        )}

        {/* Participants List */}
        <div className="max-h-[60vh] min-h-[160px] overflow-y-auto overscroll-contain space-y-1.5 pr-1">
          {isLoading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Loading participants...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="text-xs text-destructive">Failed to load participants</p>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="text-xs font-medium">No participants found</p>
            </div>
          ) : (
            filteredParticipants.map((participant) => {
              const initials = (participant.name || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              const isHost = participant.role === "host";

              return (
                <div
                  key={participant.userId}
                  onClick={() => handleUserClick(participant.userId, participant.isCurrentUser)}
                  role="button"
                  tabIndex={0}
                  className="flex items-center justify-between rounded-2xl p-2.5 hover:bg-white/5 active:scale-[0.99] transition cursor-pointer border border-transparent hover:border-white/10 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-white/15 shadow-sm">
                        {participant.avatarUrl ? (
                          <AvatarImage
                            src={getOptimizedImageUrl(participant.avatarUrl, "thumb")}
                            alt={participant.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {isHost && (
                        <div
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-black shadow-sm ring-1 ring-background"
                          title="Host"
                        >
                          <Crown size={10} className="fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {participant.name}
                        </p>
                        {participant.isCurrentUser && (
                          <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                            You
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {isHost ? (
                          <span className="flex items-center gap-1 font-medium text-amber-400">
                            <Crown size={11} />
                            Host
                          </span>
                        ) : (
                          <span>Member</span>
                        )}

                        {participant.city && (
                          <>
                            <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                            <span className="truncate">{participant.city}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground shrink-0 pl-2">
                    <span className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                      View Profile
                    </span>
                    <ChevronRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
