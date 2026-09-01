import { useEffect, useMemo, useState, useCallback } from "react";
import { Route } from "@/routes/_authenticated/participants/$outingId";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import ParticipantCard from "./widgets/ParticipantCard";
import SectionHeader from "./widgets/SectionHeader";

import {
  acceptParticipant,
  getParticipants,
  rejectParticipant,
  removeParticipant,
} from "./services/participantService";

import type { Participant } from "./models/participant";

export default function ParticipantsScreen() {
  const { outingId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [outingTitle, setOutingTitle] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      const { data: outing, error: outingError } = await supabase
        .from("outings")
        .select("id, host_id, title, max_participants")
        .eq("id", outingId)
        .single();

      if (outingError || !outing) {
        toast.error("Outing not found");
        navigate({ to: "/host-dashboard" });
        return;
      }

      if (outing.host_id !== user.id) {
        setIsHost(false);
        setLoading(false);
        return;
      }

      setIsHost(true);
      setOutingTitle(outing.title);
      setMaxParticipants(outing.max_participants);

      const data = await getParticipants(outingId);
      setParticipants(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load participants");
    } finally {
      setLoading(false);
    }
  }, [outingId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAccept(id: string) {
    try {
      setActionLoadingId(id);
      await acceptParticipant(id, outingId);
      toast.success("Participant accepted!");

      // Optimistic update for instant UI response
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "joined" as const } : p)),
      );

      // Invalidate relevant react-query caches
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["accepted-chats"] }),
        queryClient.invalidateQueries({ queryKey: ["outing-details", outingId] }),
        queryClient.invalidateQueries({ queryKey: ["explore-outings"] }),
        queryClient.invalidateQueries({ queryKey: ["join-status", outingId] }),
        queryClient.invalidateQueries({ queryKey: ["history-outings"] }),
      ]);

      // Re-fetch authoritative participant list
      const data = await getParticipants(outingId);
      setParticipants(data);
    } catch (error: any) {
      console.error("Error accepting participant:", error);
      toast.error(error.message || "Failed to accept participant");
      const data = await getParticipants(outingId);
      setParticipants(data);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    try {
      setActionLoadingId(id);
      await rejectParticipant(id, outingId);
      toast.success("Participant request rejected");

      // Optimistic remove from local state
      setParticipants((prev) => prev.filter((p) => p.id !== id));

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["accepted-chats"] }),
        queryClient.invalidateQueries({ queryKey: ["outing-details", outingId] }),
        queryClient.invalidateQueries({ queryKey: ["explore-outings"] }),
        queryClient.invalidateQueries({ queryKey: ["join-status", outingId] }),
        queryClient.invalidateQueries({ queryKey: ["history-outings"] }),
      ]);

      const data = await getParticipants(outingId);
      setParticipants(data);
    } catch (error: any) {
      console.error("Error rejecting participant:", error);
      toast.error(error.message || "Failed to reject participant");
      const data = await getParticipants(outingId);
      setParticipants(data);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRemove(id: string) {
    try {
      setActionLoadingId(id);
      await removeParticipant(id, outingId);
      toast.success("Participant removed from outing");

      // Optimistic remove from local state
      setParticipants((prev) => prev.filter((p) => p.id !== id));

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["accepted-chats"] }),
        queryClient.invalidateQueries({ queryKey: ["outing-details", outingId] }),
        queryClient.invalidateQueries({ queryKey: ["explore-outings"] }),
        queryClient.invalidateQueries({ queryKey: ["join-status", outingId] }),
        queryClient.invalidateQueries({ queryKey: ["history-outings"] }),
      ]);

      const data = await getParticipants(outingId);
      setParticipants(data);
    } catch (error: any) {
      console.error("Error removing participant:", error);
      toast.error(error.message || "Failed to remove participant");
      const data = await getParticipants(outingId);
      setParticipants(data);
    } finally {
      setActionLoadingId(null);
    }
  }

  const pending = useMemo(
    () => participants.filter((participant) => participant.status === "pending"),
    [participants],
  );

  const joined = useMemo(
    () => participants.filter((participant) => participant.status === "joined"),
    [participants],
  );

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading participants...</p>
      </div>
    );
  }

  if (isHost === false) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Unauthorized</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Only the host of this outing can view and manage participant requests.
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
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-8 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/host-dashboard" })}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-surface hover:bg-surface-elevated transition"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Participants</h1>
            <p className="text-sm text-muted-foreground">
              {outingTitle ? `For "${outingTitle}"` : "Manage outing join requests"} • (
              {joined.length}/{maxParticipants} Joined)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/chats/$outingId/group",
              params: { outingId },
            })
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 active:scale-95 transition cursor-pointer"
        >
          <Users className="h-4 w-4" /> Open Group Chat
        </button>
      </div>

      {/* Pending Requests Section */}
      <section className="space-y-4">
        <SectionHeader title="Pending Requests" count={pending.length} />

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No pending join requests.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                loading={actionLoadingId === participant.id}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </section>

      {/* Joined Participants Section */}
      <section className="space-y-4 pt-4">
        <SectionHeader title="Joined Participants" count={joined.length} />

        {joined.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No participants have joined yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {joined.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                loading={actionLoadingId === participant.id}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
