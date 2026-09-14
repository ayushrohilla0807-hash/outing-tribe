import { Plus } from "lucide-react";

type InterestsSectionProps = {
  interests: string[];
  onAddInterestClick?: () => void;
};

const INTEREST_EMOJIS: Record<string, string> = {
  Movies: "🎬",
  Music: "🎵",
  Netflix: "🍿",
  Concerts: "🎤",
  "Stand-up Comedy": "🎙️",
  Anime: "🎌",
  Cricket: "🏏",
  Football: "⚽",
  Badminton: "🏸",
  Basketball: "🏀",
  Volleyball: "🏐",
  Gym: "💪",
  Running: "🏃",
  Cycling: "🚴",
  Swimming: "🏊",
  Yoga: "🧘",
  Travel: "✈️",
  "Road Trips": "🚗",
  Food: "🍔",
  Cafés: "☕",
  Shopping: "🛍️",
  Photography: "📸",
  Pets: "🐾",
  Reading: "📚",
  Coding: "💻",
  Painting: "🎨",
  Art: "🖼️",
  Chess: "♟️",
  "Board Games": "🎲",
  Cooking: "🍳",
  Dance: "💃",
};

export default function InterestsSection({ interests, onAddInterestClick }: InterestsSectionProps) {
  return (
    <section className="pt-2 pb-1">
      {/* Instagram-style Story Highlights carousel */}
      <div className="flex items-center gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-none overscroll-contain">
        {interests.map((interest) => {
          const emoji = INTEREST_EMOJIS[interest] || "✨";

          return (
            <div
              key={interest}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className="p-[2px] rounded-full border border-white/20 bg-white/5 group-hover:border-primary/60 group-hover:scale-105 transition-all duration-200">
                <div className="flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center rounded-full bg-surface text-2xl shadow-inner">
                  <span>{emoji}</span>
                </div>
              </div>

              <span className="w-16 truncate text-center text-[11px] font-medium text-foreground/80 group-hover:text-foreground">
                {interest}
              </span>
            </div>
          );
        })}

        {/* Add Highlight button */}
        {onAddInterestClick && (
          <button
            type="button"
            onClick={onAddInterestClick}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className="p-[2px] rounded-full border border-dashed border-white/25 bg-white/5 group-hover:border-primary group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-200">
              <div className="flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center rounded-full bg-surface text-muted-foreground group-hover:text-primary transition">
                <Plus className="h-5 w-5" />
              </div>
            </div>

            <span className="w-16 truncate text-center text-[11px] font-medium text-muted-foreground group-hover:text-primary">
              Add
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
