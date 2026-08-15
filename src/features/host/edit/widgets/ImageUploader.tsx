import { useState } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadOutingImage } from "../services/editOutingService";
import { toast } from "sonner";

interface ImageUploaderProps {
  image: string;
  onChange: (value: string) => void;
}

export default function ImageUploader({ image, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadOutingImage(file);
      onChange(url);
      toast.success("Cover image uploaded!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Cover Image</label>

      {image ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <img src={image} alt="Outing" className="h-64 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">No image uploaded</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <label className="flex flex-1 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{uploading ? "Uploading..." : "Upload New Image"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <input
          type="text"
          value={image}
          placeholder="Or paste image URL"
          onChange={(e) => onChange(e.target.value)}
          className="w-full sm:flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
