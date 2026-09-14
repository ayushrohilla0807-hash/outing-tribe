import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  Share2,
  Shield,
  Edit,
  UserCheck,
  Loader2,
  Bookmark,
  Sparkles,
  Check,
  ChevronRight,
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
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

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
  } = useQuery({
    queryKey: ["outing-details", id],
    queryFn: () => getOutingById(id),
  });

  const { data: joinStatus = "none", isLoading: statusLoading } = useQuery<JoinStatus>({
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
      await queryClient.invalidateQueries({ queryKey: ["accepted-chats"] });
      await queryClient.invalidateQueries({ queryKey: ["history-outings"] });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send join request");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleLeave() {
    if (!window.confirm("Are you sure you want to leave / withdraw request for this outing?"))
      return;
    try {
      setJoinLoading(true);
      await leaveOuting(id);
      toast.success("You have left the outing");
      await queryClient.invalidateQueries({ queryKey: ["join-status", id] });
      await queryClient.invalidateQueries({ queryKey: ["outing-details", id] });
      await queryClient.invalidateQueries({ queryKey: ["explore-outings"] });
      await queryClient.invalidateQueries({ queryKey: ["accepted-chats"] });
      await queryClient.invalidateQueries({ queryKey: ["history-outings"] });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to leave outing");
    } finally {
      setJoinLoading(false);
    }
  }

  const FALLBACK_COVER =
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1600&auto=format&fit=crop&q=80";
  const [coverSrc, setCoverSrc] = useState(() =>
    outing?.cover_image ? getOptimizedImageUrl(outing.cover_image, "hero") : FALLBACK_COVER,
  );

  useEffect(() => {
    if (outing?.cover_image) {
      setCoverSrc(getOptimizedImageUrl(outing.cover_image, "hero"));
    }
  }, [outing?.cover_image]);

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
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-200">Loading outing details...</p>
      </div>
    );
  }

  if (isError || !outing) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h2 className="text-2xl font-bold text-white">Outing Not Found</h2>
        <p className="mt-2 text-sm text-slate-300">
          This outing may have been removed or does not exist.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const spotsLeft = Math.max(0, outing.max_participants - outing.joinedCount);
  const fillPercentage = Math.min(
    100,
    Math.round((outing.joinedCount / outing.max_participants) * 100),
  );

  return (
    <main className="mx-auto max-w-3xl pb-64 sm:pb-72">
      {/* 1. Large Immersive Cover Image & Floating Navigation */}
      <div className="relative h-80 sm:h-[420px] w-full overflow-hidden bg-surface">
        <img
          src={coverSrc}
          alt={outing.title}
          onError={() => setCoverSrc(FALLBACK_COVER)}
          className="h-full w-full object-cover"
          decoding="async"
        />

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-black/60" />

        {/* Floating Top Navigation with safe area */}
        <div className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] inset-x-4 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={() => navigate({ to: "/explore" })}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 active:scale-95 transition cursor-pointer shadow-lg"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 active:scale-95 transition cursor-pointer shadow-lg"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <button
              type="button"
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
              className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md border transition cursor-pointer shadow-lg ${
                isSaved(outing.id)
                  ? "bg-primary border-primary text-primary-foreground shadow-glow scale-105"
                  : "bg-black/50 border-white/20 text-white hover:bg-black/70 active:scale-95"
              }`}
              aria-label={isSaved(outing.id) ? "Remove from saved" : "Save outing"}
            >
              <Bookmark className={`h-5 w-5 ${isSaved(outing.id) ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Category & Status Badges Floating over Cover */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/25 px-4 py-1.5 text-xs font-bold text-amber-200 shadow-md">
              <Sparkles size={13} className="text-amber-300" />
              {outing.category}
            </span>

            {outing.status === "completed" && (
              <span className="rounded-full bg-blue-500/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
                Completed
              </span>
            )}
            {outing.status === "cancelled" && (
              <span className="rounded-full bg-destructive/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
                Cancelled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Body Content with High-Contrast Typography & Surface Styling */}
      <div className="space-y-5 px-5 sm:px-6 pt-5">
        {/* Outing Title */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {outing.title}
          </h1>
        </div>

        {/* Date + Schedule Card */}
        <div className="rounded-3xl border border-white/15 bg-card p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md flex-shrink-0">
              <Calendar size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Date & Schedule
              </p>
              <p className="text-lg font-extrabold text-white mt-0.5">{outing.outing_date}</p>
              <div className="flex items-center gap-2 text-sm text-slate-200 mt-1 font-medium">
                <Clock size={15} className="text-amber-200 flex-shrink-0" />
                <span>
                  {outing.start_time}
                  {outing.end_time ? ` – ${outing.end_time}` : " onwards"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Venue Card */}
        <div className="rounded-3xl border border-white/15 bg-card p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md flex-shrink-0">
              <MapPin size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Location & Venue
              </p>
              <p className="text-lg font-extrabold text-white mt-0.5">{outing.location}</p>
              <p className="text-sm text-slate-200 mt-1 font-medium">
                {outing.city ? `${outing.city}, India` : "India"}
              </p>
            </div>
          </div>
        </div>

        {/* Participants & Availability Card */}
        <div className="rounded-3xl border border-white/15 bg-card p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md flex-shrink-0">
                <Users size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Availability
                </p>
                <p className="text-base font-extrabold text-white mt-0.5">
                  {outing.joinedCount} of {outing.max_participants} Spots Filled
                </p>
              </div>
            </div>

            <span className="rounded-full bg-primary/25 border border-primary/40 px-3.5 py-1 text-xs font-bold text-amber-100">
              {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/30 border border-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 shadow-sm"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>

          {/* Joined Members Avatar List */}
          {outing.joinedParticipants.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Joined Participants ({outing.joinedParticipants.length})
              </p>
              <div className="flex flex-wrap gap-2.5">
                {outing.joinedParticipants.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 shadow-sm"
                  >
                    <img
                      src={
                        member.avatar
                          ? getOptimizedImageUrl(member.avatar, "thumb")
                          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                      }
                      alt={member.name}
                      loading="lazy"
                      decoding="async"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-white">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Organizer Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            const hostUserId = outing.host.id || outing.host_id;
            if (hostUserId) {
              navigate({
                to: "/profile/$userId",
                params: { userId: hostUserId },
              });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const hostUserId = outing.host.id || outing.host_id;
              if (hostUserId) {
                navigate({
                  to: "/profile/$userId",
                  params: { userId: hostUserId },
                });
              }
            }
          }}
          className="group rounded-3xl border border-white/15 bg-card p-5 shadow-lg hover:border-primary/50 hover:bg-card/90 active:scale-[0.99] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label={`View ${outing.host.full_name}'s public profile`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Organized By
            </p>
            <span className="text-[11px] font-semibold text-primary group-hover:underline flex items-center gap-1 transition">
              View Profile{" "}
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={
                  outing.host.avatar_url
                    ? getOptimizedImageUrl(outing.host.avatar_url, "thumb")
                    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                }
                alt={outing.host.full_name}
                loading="lazy"
                decoding="async"
                className="h-13 w-13 rounded-full object-cover border-2 border-primary shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-white group-hover:text-primary transition-colors">
                    {outing.host.full_name}
                  </h4>
                  <span className="rounded-full bg-primary/30 border border-primary/50 px-2.5 py-0.5 text-[10px] font-bold text-amber-100">
                    HOST
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5 font-medium">
                  {outing.host.city ? `From ${outing.host.city}` : "Outsy Creator"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-sm">
              <Shield size={14} className="stroke-[2.5]" /> Verified
            </div>
          </div>
        </div>

        {/* About the Outing / Details Card */}
        <div className="rounded-3xl border border-white/15 bg-card p-5 shadow-lg space-y-3">
          <h3 className="text-lg font-bold tracking-tight text-white">About this outing</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200 font-normal">
            {outing.description || "No description provided."}
          </p>

          {outing.rules && (
            <div className="mt-4 rounded-2xl border border-white/15 bg-black/20 p-4">
              <p className="text-xs font-bold text-amber-200 uppercase tracking-wider mb-1.5">
                Guidelines & Rules
              </p>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">{outing.rules}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar: Positioned above mobile BottomNav with safe-area offset */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-40 border-t border-white/15 bg-background/98 px-4 py-3.5 backdrop-blur-xl shadow-2xl">
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
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-glow px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow active:scale-98 transition cursor-pointer"
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
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/20 active:scale-98 transition cursor-pointer"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
            </div>
          ) : (
            /* Guest / Participant Controls */
            <div className="flex w-full items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Status
                </p>
                <p className="text-sm font-extrabold text-white truncate">
                  {joinStatus === "joined"
                    ? "✓ You are attending"
                    : joinStatus === "pending"
                      ? "⏳ Request Pending"
                      : `${spotsLeft} spots available`}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* 1. Joined State */}
                {joinStatus === "joined" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/chats/$outingId/group",
                          params: {
                            outingId: id,
                          },
                        })
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-glow px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-98 transition cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" /> Group Chat
                    </button>
                    <button
                      type="button"
                      onClick={handleLeave}
                      disabled={joinLoading}
                      className="inline-flex items-center justify-center rounded-full border border-destructive/40 bg-destructive/15 px-4 py-3 text-xs font-bold text-destructive hover:bg-destructive/25 active:scale-98 transition cursor-pointer"
                    >
                      Leave
                    </button>
                  </>
                )}

                {/* 2. Pending State */}
                {joinStatus === "pending" && (
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-pending/30 border border-pending/50 px-4 py-2.5 text-xs font-bold text-amber-100">
                      <Clock className="h-3.5 w-3.5 text-amber-200" /> Pending
                    </span>
                    <button
                      type="button"
                      onClick={handleLeave}
                      disabled={joinLoading}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/20 active:scale-98 transition cursor-pointer"
                    >
                      Withdraw
                    </button>
                  </div>
                )}

                {/* 3. Open State (Join CTA) */}
                {joinStatus === "none" && (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={joinLoading || statusLoading || spotsLeft === 0}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-primary-foreground shadow-glow transition cursor-pointer ${
                      spotsLeft === 0
                        ? "bg-white/10 text-slate-400 opacity-60 cursor-not-allowed"
                        : "bg-primary hover:bg-primary-glow hover:opacity-95 active:scale-95"
                    }`}
                  >
                    {joinLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : spotsLeft === 0 ? (
                      "Outing Full"
                    ) : (
                      "Join Outing"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
