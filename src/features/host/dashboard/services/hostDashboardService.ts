import { supabase } from "@/integrations/supabase/client";
import { deleteOutingImages } from "@/lib/imageStorageService";
import type { HostedOuting } from "../models/hostedOuting";

export async function getHostedOutings(): Promise<HostedOuting[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return [];

  const { data, error } = await supabase
    .from("outings")
    .select(
      `
      *,
      participants (
        id,
        status
      )
    `,
    )
    .eq("host_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (
    data?.map((item: any) => {
      const participants = (item.participants as any[]) || [];
      const joinedCount = participants.filter((p) => p.status === "joined").length;
      const pendingCount = participants.filter((p) => p.status === "pending").length;

      return {
        id: item.id,
        title: item.title,
        category: item.category,
        image: item.cover_image ?? "",
        location: item.location,
        date: item.outing_date,
        time: item.start_time,
        joined: joinedCount,
        pending: pendingCount,
        capacity: item.max_participants,
        status: item.status,
      };
    }) ?? []
  );
}

export async function markCompleted(id: string, hostId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== hostId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("outings")
    .update({ status: "completed" })
    .eq("id", id)
    .eq("host_id", user.id);

  if (error) throw error;
}

export async function cancelOuting(id: string, hostId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== hostId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("outings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("host_id", user.id);

  if (error) throw error;
}

export async function deleteOutingPermanently(id: string, hostId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== hostId) throw new Error("Unauthorized");

  // Retrieve current cover_image reference before deletion
  const { data: outing } = await supabase
    .from("outings")
    .select("cover_image")
    .eq("id", id)
    .eq("host_id", user.id)
    .maybeSingle();

  // Delete DB record
  const { error } = await supabase.from("outings").delete().eq("id", id).eq("host_id", user.id);

  if (error) throw error;

  // Clean up storage images after DB deletion succeeds
  if (outing?.cover_image) {
    try {
      await deleteOutingImages(outing.cover_image);
    } catch (cleanupErr) {
      console.error("[deleteOutingPermanently] Storage cleanup error:", cleanupErr);
    }
  }
}
