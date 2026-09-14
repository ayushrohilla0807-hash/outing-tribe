import { supabase } from "@/integrations/supabase/client";
import { uploadOptimizedOutingImages } from "@/lib/imageOptimization";
import { deleteOutingImages, extractStoragePath } from "@/lib/imageStorageService";

export interface EditOutingData {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  endTime?: string | null;
  location: string;
  city?: string;
  capacity: number;
  image: string;
  rules?: string | null;
}

export async function getOuting(id: string): Promise<EditOutingData | null> {
  const { data, error } = await supabase.from("outings").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    date: data.outing_date,
    time: data.start_time,
    endTime: data.end_time,
    location: data.location,
    city: data.city,
    capacity: data.max_participants,
    image: data.cover_image ?? "",
    rules: data.rules,
  };
}

export async function updateOuting(
  updated: EditOutingData,
  previousCoverImage?: string | null,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // 1. Update database record first
  const { error } = await supabase
    .from("outings")
    .update({
      title: updated.title,
      description: updated.description,
      category: updated.category,
      outing_date: updated.date,
      start_time: updated.time,
      end_time: updated.endTime || null,
      location: updated.location,
      city: updated.city || "",
      max_participants: updated.capacity,
      cover_image: updated.image || null,
      rules: updated.rules || null,
    })
    .eq("id", updated.id)
    .eq("host_id", user.id);

  if (error) throw error;

  // 2. Only after DB update succeeds, clean up previous image variants if replaced
  if (previousCoverImage && previousCoverImage !== updated.image) {
    const oldPath = extractStoragePath(previousCoverImage);
    const newPath = extractStoragePath(updated.image);

    // Only delete if old image was in our storage and is not the same storage path
    if (oldPath && oldPath !== newPath) {
      try {
        await deleteOutingImages(previousCoverImage);
      } catch (cleanupErr) {
        console.error("[updateOuting] Failed to clean up old outing image:", cleanupErr);
      }
    }
  }
}

export async function uploadOutingImage(file: File, outingId?: string): Promise<string> {
  // Use unique timestamped folder to guarantee old images are not prematurely overwritten
  const uniqueFolder = outingId ? `${outingId}-${Date.now()}` : undefined;
  const { canonicalUrl } = await uploadOptimizedOutingImages(file, uniqueFolder);
  return canonicalUrl;
}
