import type { Outing } from "../models/outing";

export async function createOuting(
  outing: Outing,
): Promise<void> {
  console.log("Creating outing...", outing);

  // Later this becomes Supabase insert.
}

export async function getOutings(): Promise<Outing[]> {
  return [];
}