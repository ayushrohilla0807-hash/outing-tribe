import { ImagePlus } from "lucide-react";

type Props = {
  image: string;
  onChange: (value: string) => void;
};

export default function CoverUploader({
  image,
  onChange,
}: Props) {
  return (
    <div className="space-y-3">

      <label className="font-medium">
        Cover Image
      </label>

      <div className="relative overflow-hidden rounded-3xl border">

        {image ? (
          <img
            src={image}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 flex-col items-center justify-center gap-3 text-muted-foreground">

            <ImagePlus size={36} />

            <p>Paste Image URL</p>

          </div>
        )}

      </div>

      <input
        className="w-full rounded-xl border p-3"
        placeholder="https://..."
        value={image}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}