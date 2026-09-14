import { supabase } from "@/integrations/supabase/client";

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

export async function updateOuting(updated: EditOutingData): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

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
}

import { uploadOptimizedOutingImages } from "@/lib/imageOptimization";

export async function uploadOutingImage(file: File, outingId?: string): Promise<string> {
  const { canonicalUrl } = await uploadOptimizedOutingImages(file, outingId);
  return canonicalUrl;
}
