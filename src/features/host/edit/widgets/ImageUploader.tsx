interface ImageUploaderProps {
    image: string;
    onChange: (value: string) => void;
  }
  
  export default function ImageUploader({
    image,
    onChange,
  }: ImageUploaderProps) {
    return (
      <div className="space-y-3">
  
        <label className="text-sm font-medium">
          Cover Image
        </label>
  
        <img
          src={image}
          alt="Outing"
          className="h-64 w-full rounded-2xl object-cover border"
        />
  
        <input
          type="text"
          value={image}
          placeholder="Paste image URL"
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border px-4 py-3"
        />
  
      </div>
    );
  }