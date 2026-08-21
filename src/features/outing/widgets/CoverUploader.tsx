import { ImagePlus, Trash2, AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import type { CreateOutingForm } from "../schema";

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024; // Strictly less than 1 MB (1,048,576 bytes)

export default function CoverUploader() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateOutingForm>();

  const image = watch("image");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }

    if (image instanceof File) {
      const url = URL.createObjectURL(image);
      setPreview(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  function handleFile(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size >= MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image size must be less than 1 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setValue("image", undefined as any, {
        shouldValidate: true,
      });
      return;
    }

    setValue("image", file, {
      shouldValidate: true,
    });
  }

  function handleRemove() {
    setValue("image", undefined as any, {
      shouldValidate: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Cover Image <span className="text-primary">*</span>
        </label>
        <span className="text-xs text-muted-foreground">Compulsory • Max 1 MB</span>
      </div>

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5">
          <img src={preview} alt="Cover Preview" className="h-64 w-full object-cover" />

          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-3 top-3 rounded-full bg-black/70 hover:bg-black p-2 text-white shadow-md transition cursor-pointer backdrop-blur-md"
            title="Remove image"
            aria-label="Remove cover image"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ) : (
        <label
          className={`flex h-60 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition p-6 text-center ${
            errors.image
              ? "border-destructive/60 bg-destructive/5"
              : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/50"
          }`}
        >
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-primary">
            <ImagePlus className="h-6 w-6" />
          </div>

          <span className="font-semibold text-foreground">Upload Cover Image *</span>

          <span className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, or WEBP (strictly under 1 MB)
          </span>

          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}

      {errors.image && (
        <div className="flex items-center gap-1.5 text-xs text-destructive font-medium mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errors.image.message as string}</span>
        </div>
      )}
    </div>
  );
}
