import { Calendar, MapPin, Bookmark } from "lucide-react";
import { useState } from "react";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80";

type Props = {
  id?: string;
  image: string;
  title: string;
  category: string;
  location: string;
  date: string;
  saved: boolean;
  onCardClick?: () => void;
  onSave: () => void;
  // Optional props for backward-compatibility if passed
  host?: string;
  hostAvatar?: string;
  rating?: number;
  joinedCount?: number;
  capacity?: number;
  status?: string;
  loading?: boolean;
  onJoin?: () => void;
};

export default function OutingCard({
  image,
  title,
  category,
  location,
  date,
  saved,
  onCardClick,
  onSave,
}: Props) {
  const [imgSrc, setImgSrc] = useState(image || FALLBACK_COVER);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick?.();
        }
      }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-3.5 sm:p-4 shadow-card hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Media Container with Floating Badges */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-white/5">
        <img
          src={imgSrc}
          alt={title}
          onError={() => setImgSrc(FALLBACK_COVER)}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle Bottom Gradient on Image for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Floating Category Pill (Top-Left) */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {category}
          </span>
        </div>

        {/* Floating Bookmark Button (Top-Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className={`absolute top-3 right-3 flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full backdrop-blur-md border transition cursor-pointer ${
            saved
              ? "bg-primary border-primary text-primary-foreground shadow-glow scale-105"
              : "bg-black/50 border-white/20 text-white hover:bg-black/70 hover:scale-105 active:scale-95"
          }`}
          aria-label={saved ? "Remove from saved" : "Save outing"}
        >
          <Bookmark size={18} className={saved ? "fill-current" : ""} />
        </button>
      </div>

      {/* Card Content Below Image */}
      <div className="px-1 pt-3 pb-0.5 space-y-1.5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <MapPin size={14} className="flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Date & Time */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar size={14} className="flex-shrink-0 text-muted-foreground" />
          <span className="truncate">{date}</span>
        </div>
      </div>
    </div>
  );
}
