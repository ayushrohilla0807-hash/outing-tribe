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

export const createOutingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Title must be at least 5 characters.")
      .max(80, "Title cannot exceed 80 characters."),

    description: z
      .string()
      .trim()
      .min(30, "Description must be at least 30 characters.")
      .max(500, "Description cannot exceed 500 characters."),

    category: z.enum(outingCategories, {
      required_error: "Please select a category.",
    }),

    location: z.string().trim().min(3, "Location is required (at least 3 characters)."),

    city: z.string().trim().min(2, "City is required (at least 2 characters)."),

    date: z.string().min(1, "Start date is required."),

    startTime: z.string().min(1, "Start time is required."),

    endDate: z.string().min(1, "End date is required."),

    endTime: z.string().min(1, "End time is required."),

    participants: z.number().min(2, "Minimum 2 participants.").max(50, "Maximum 50 participants."),

    rules: z.string().optional(),

    priceType: z.enum(["free", "paid"]),

    price: z.number().optional(),

    image: z.any().optional(),

    acceptedGuidelines: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Image validation: Compulsory and strictly < 1 MB
    if (!data.image || !(data.image instanceof File)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please upload an image for your outing.",
        path: ["image"],
      });
    } else if (data.image.size >= 1024 * 1024) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Image size must be less than 1 MB.",
        path: ["image"],
      });
    }

    // 2. Start date & time must not be in past in user's local timezone
    if (data.date && data.startTime) {
      const now = new Date();
      const localYear = now.getFullYear();
      const localMonth = String(now.getMonth() + 1).padStart(2, "0");
      const localDay = String(now.getDate()).padStart(2, "0");
      const todayStr = `${localYear}-${localMonth}-${localDay}`;

      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (data.date < todayStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date cannot be in the past.",
          path: ["date"],
        });
      } else if (data.date === todayStr && data.startTime < currentTimeStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start time cannot be in the past.",
          path: ["startTime"],
        });
      }
    }

    // 3. End date/time must be strictly after start date/time
    if (data.endDate) {
      const now = new Date();
      const localYear = now.getFullYear();
      const localMonth = String(now.getMonth() + 1).padStart(2, "0");
      const localDay = String(now.getDate()).padStart(2, "0");
      const todayStr = `${localYear}-${localMonth}-${localDay}`;

      if (data.endDate < todayStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date cannot be in the past.",
          path: ["endDate"],
        });
      }
    }

    if (data.date && data.endDate && data.endDate < data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be earlier than start date.",
        path: ["endDate"],
      });
    }

    if (data.date && data.startTime && data.endDate && data.endTime) {
      const startDateTimeStr = `${data.date}T${data.startTime}`;
      const endDateTimeStr = `${data.endDate}T${data.endTime}`;

      if (endDateTimeStr <= startDateTimeStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time must be after start time.",
          path: ["endTime"],
        });
      }
    }
  });

export type CreateOutingForm = z.infer<typeof createOutingSchema>;
