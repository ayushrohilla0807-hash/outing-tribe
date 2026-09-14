import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createOutingSchema, type CreateOutingForm } from "../schema";

import { createOuting } from "../services/outingService";
import { validateImageFile, uploadOptimizedOutingImages } from "@/lib/imageOptimization";

export function useCreateOuting() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const form = useForm<CreateOutingForm>({
    resolver: zodResolver(createOutingSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      category: "Coffee",
      location: "",
      city: "",
      date: "",
      startTime: "",
      endDate: "",
      endTime: "",
      participants: 5,
      rules: "",
      priceType: "free",
      price: 0,
      image: undefined,
      acceptedGuidelines: false,
    },
  });

  const onSubmit: SubmitHandler<CreateOutingForm> = async (values) => {
    try {
      setLoading(true);

      const validation = validateImageFile(values.image);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid image selected.");
        setLoading(false);
        return;
      }

      // Generate and upload optimized WebP variants (hero, card, thumb) to Supabase Storage
      const { canonicalUrl } = await uploadOptimizedOutingImages(values.image);
      const imageUrl = canonicalUrl;

      await createOuting({
        title: values.title,
        description: values.description,
        category: values.category,
        location: values.location,
        city: values.city,
        outing_date: values.date,
        start_time: values.startTime,
        end_time: values.endTime || null,
        max_participants: values.participants,
        cover_image: imageUrl || null,
      });

      toast.success("Outing created successfully!");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["explore-outings"] }),
        queryClient.invalidateQueries({ queryKey: ["history-outings"] }),
        queryClient.invalidateQueries({ queryKey: ["hosted-outings"] }),
      ]);

      navigate({
        to: "/host-dashboard",
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to create outing.");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit,
  };
}
