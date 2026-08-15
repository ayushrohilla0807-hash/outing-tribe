import { z } from "zod";

export const outingCategories = [
  "Coffee",
  "Food",
  "Movies",
  "Sports",
  "Gaming",
  "Road Trip",
  "Photography",
  "Hiking",
  "Music",
  "Study",
  "Shopping",
  "Fitness",
  "Travel",
  "Art",
  "Party",
  "Other",
] as const;

export const createOutingSchema = z.object({
  title: z.string().trim().min(5).max(80),

  description: z.string().trim().min(30).max(500),

  category: z.enum(outingCategories),

  location: z.string().trim().min(3),

  city: z.string().trim().min(2),

  date: z.string().min(1),

  startTime: z.string().min(1),

  endTime: z.string().optional(),

  participants: z.number().min(2).max(50),

  rules: z.string().optional(),

  priceType: z.enum(["free", "paid"]),

  price: z.number().optional(),

  image: z.any().optional(),

  acceptedGuidelines: z.boolean().optional(),
});

export type CreateOutingForm = z.infer<typeof createOutingSchema>;
