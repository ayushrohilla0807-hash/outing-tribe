import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import type { CreateOutingForm } from "../schema";

export default function CoverUploader() {
  const { setValue, watch } = useFormContext<CreateOutingForm>();

  const image = watch("image");

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
      toast.error("Please select an image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image.");
      return;
    }

    setValue("image", file, {
      shouldValidate: true,
    });
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold">Cover Image</label>

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border">
          <img src={preview} alt="Cover Preview" className="h-64 w-full object-cover" />

          <button
            type="button"
            onClick={() =>
              setValue("image", undefined, {
                shouldValidate: true,
              })
            }
            className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ) : (
        <label className="flex h-60 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition hover:bg-muted">
          <ImagePlus className="mb-3 h-10 w-10" />

          <span className="font-medium">Upload Cover Image</span>

          <span className="mt-1 text-sm text-muted-foreground">JPG • PNG • WEBP</span>

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
    </div>
  );
}
