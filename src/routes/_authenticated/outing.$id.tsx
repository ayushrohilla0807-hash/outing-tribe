import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  MessageCircle,
  Share2,
  Shield,
  Edit,
  UserCheck,
  Ban,
  Loader2,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { getOutingById } from "@/features/outing/details/services/outingDetailsService";
import {
  getJoinStatus,
  joinOuting,
  leaveOuting,
  type JoinStatus,
} from "@/features/outing/join/services/participantService";
import { useSaved } from "@/features/outing/saved/context/SavedContext";
import JoinButton from "@/features/outing/join/widgets/JoinButton";
import RequestStatus from "@/features/outing/join/widgets/RequestStatus";

export const Route = createFileRoute("/_authenticated/outing/$id")({
  component: OutingDetailsPage,
});

function OutingDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSaved, toggleSaved } = useSaved();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const {
    data: outing,
    isLoading: outingLoading,
    isError,
    refetch: refetchOuting,
  } = useQuery({
    queryKey: ["outing-details", id],
    queryFn: () => getOutingById(id),
  });

  const {
    data: joinStatus = "none",
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery<JoinStatus>({
    queryKey: ["join-status", id],
    queryFn: () => getJoinStatus(id),
    enabled: !!id,
  });

  const isHost = currentUserId && outing && outing.host_id === currentUserId;

  async function handleJoin() {
    if (joinLoading) return;
    try {
      setJoinLoading(true);
      await joinOuting(id);
      toast.success("Join request sent to host!");
      await queryClient.invalidateQueries({ queryKey: ["join-status", id] });
      await queryClient.invalidateQueries({ queryKey: ["outing-details", id] });
      await queryClient.invalidateQueries({ queryKey: ["explore-outings"] });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send join request");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleLeave() {
    if (!window.confirm("Are you sure you want to leave this outing?")) return;
    try {
      setJoinLoading(true);
      await leaveOuting(id);
      toast.success("You have left the outing");
      await queryClient.invalidateQueries({ queryKey: ["join-status", id] });
      await queryClient.invalidateQueries({ queryKey: ["outing-details", id] });
      await queryClient.invalidateQueries({ queryKey: ["explore-outings"] });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to leave outing");
    } finally {
      setJoinLoading(false);
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: outing?.title,
          text: `Join me for ${outing?.title} on Outsy!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (outingLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading outing details...</p>
      </div>
    );
  }

  if (isError || !outing) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h2 className="text-xl font-bold">Outing Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This outing may have been removed or does not exist.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl pb-32">
      {/* Top Media & Back Nav */}
      <div className="relative h-72 w-full sm:h-96">
        <img
          src={
            outing.cover_image ||
            "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80"
          }
          alt={outing.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/60" />

        {/* Floating Top Nav */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/explore" })}
            className="grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                toggleSaved({
                  id: outing.id,
                  title: outing.title,
                  image: outing.cover_image || "",
                  category: outing.category,
                  location: outing.location,
                  date: `${outing.outing_date} • ${outing.start_time}`,
                  host: outing.host.full_name,
                  hostAvatar: outing.host.avatar_url || undefined,
                  rating: 5,
                  joined: outing.joinedCount,
                  capacity: outing.max_participants,
                })
              }
              className={`grid h-10 w-10 place-items-center rounded-full backdrop-blur transition ${
                isSaved(outing.id)
                  ? "bg-red-500 text-white"
                  : "bg-black/50 text-white hover:bg-black/70"
              }`}
              aria-label="Save"
            >
              <Bookmark className={`h-5 w-5 ${isSaved(outing.id) ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Category Badge on Cover */}
        <div className="absolute bottom-4 left-6 flex items-center gap-2">
          <span className="rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
            {outing.category}
          </span>
          {outing.status === "completed" && (
            <span className="rounded-full bg-blue-500/80 px-3 py-1 text-xs font-semibold text-white">
              Completed
            </span>
          )}
          {outing.status === "cancelled" && (
            <span className="rounded-full bg-red-500/80 px-3 py-1 text-xs font-semibold text-white">
              Cancelled
            </span>
          )}
        </div>
      </div>

      <div className="space-y-8 px-6 pt-6">
        {/* Title & Stats */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            {outing.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <Users className="h-4 w-4 text-primary" />
              {outing.joinedCount} / {outing.max_participants} Spots Filled
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              {outing.location}
              {outing.city ? `, ${outing.city}` : ""}
            </span>
          </div>
        </div>

        {/* Outing Meta Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-surface p-4">
            <Calendar className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-semibold mt-0.5">{outing.outing_date}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface p-4">
            <Clock className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-semibold mt-0.5">{outing.start_time}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface p-4">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Capacity</p>
            <p className="text-sm font-semibold mt-0.5">{outing.max_participants} Max</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface p-4">
            <Shield className="h-5 w-5 text-success mb-2" />
            <p className="text-xs text-muted-foreground">Safety</p>
            <p className="text-sm font-semibold mt-0.5 text-success">Public Meetup</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xl font-bold tracking-tight">About this outing</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {outing.description || "No description provided."}
          </p>
        </div>

        {/* Rules */}
        {outing.rules && (
          <div className="rounded-2xl border border-white/10 bg-surface/60 p-5">
            <h3 className="text-base font-semibold">Guidelines & Rules</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{outing.rules}</p>
          </div>
        )}

        {/* Host / Organizer Profile */}
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">Organizer</h2>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface p-5">
            <div className="flex items-center gap-4">
              <img
                src={
                  outing.host.avatar_url ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                }
                alt={outing.host.full_name}
                className="h-14 w-14 rounded-full object-cover border border-white/10"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{outing.host.full_name}</h3>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    HOST
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {outing.host.city ? `From ${outing.host.city}` : "Outsy Host"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" /> 5.0
            </div>
          </div>
        </div>

        {/* Joined Participants Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">
              Joined Members ({outing.joinedParticipants.length})
            </h2>
          </div>

          {outing.joinedParticipants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No members have joined yet. Be the first to join!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {outing.joinedParticipants.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface/50 p-3"
                >
                  <img
                    src={
                      member.avatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                    }
                    alt={member.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <p className="truncate text-xs font-semibold">{member.name}</p>
                    <p className="text-[10px] text-success">Joined</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-20 inset-x-0 z-40 border-t border-white/10 bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          {isHost ? (
            /* Host Controls */
            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/participants/$outingId",
                    params: { outingId: id },
                  })
                }
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition"
              >
                <UserCheck className="h-4 w-4" />
                Manage Requests {outing.pendingCount > 0 && `(${outing.pendingCount})`}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/host-dashboard-edit/$outingId",
                    params: { outingId: id },
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
            </div>
          ) : (
            /* Guest / Participant Controls */
            <div className="flex w-full items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-bold capitalize text-foreground">
                  {joinStatus === "joined"
                    ? "You are attending"
                    : joinStatus === "pending"
                      ? "Pending approval"
                      : "Open to join"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {joinStatus === "joined" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/chats/$outingId/$userId",
                          params: {
                            outingId: id,
                            userId: outing.host_id,
                          },
                        })
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition"
                    >
                      <MessageCircle className="h-4 w-4" /> Open Chat
                    </button>
                    <button
                      type="button"
                      onClick={handleLeave}
                      disabled={joinLoading}
                      className="inline-flex items-center justify-center rounded-full border border-destructive/30 px-3 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition"
                    >
                      Leave
                    </button>
                  </>
                )}

                {joinStatus !== "joined" && (
                  <JoinButton
                    status={joinStatus}
                    loading={joinLoading || statusLoading}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
