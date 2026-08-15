import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createOutingSchema, type CreateOutingForm } from "../schema";

import { createOuting } from "../services/outingService";
import { supabase } from "@/integrations/supabase/client";

export function useCreateOuting() {
  const navigate = useNavigate();

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

      let imageUrl = "";

      // Upload image to Supabase Storage
      if (values.image instanceof File) {
        const fileExt = values.image.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("outing-image")
          .upload(fileName, values.image);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from("outing-image").getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

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
