import { useState, useMemo } from "react";
import { Search, Smile, ThumbsUp, Coffee, Heart, Sparkles } from "lucide-react";

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "popular",
    name: "Popular",
    icon: <Sparkles size={16} />,
    emojis: [
      "😂",
      "👍",
      "❤️",
      "🔥",
      "😊",
      "🙏",
      "🎉",
      "☕",
      "🍕",
      "✨",
      "😍",
      "🙌",
      "🥳",
      "😎",
      "💯",
    ],
  },
  {
    id: "smileys",
    name: "Smileys",
    icon: <Smile size={16} />,
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤗",
      "🫣",
      "🤭",
      "🫢",
      "🫡",
      "🤔",
      "🤫",
      "🫠",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "😮‍💨",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "🥸",
      "😎",
      "🤓",
      "🧐",
      "😭",
      "😤",
      "😡",
      "🤬",
      "💀",
      "👻",
    ],
  },
  {
    id: "gestures",
    name: "Gestures",
    icon: <ThumbsUp size={16} />,
    emojis: [
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
      "🤌",
      "🤏",
      "✌️",
      "🤞",
      "🫰",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "🫶",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💅",
      "🤳",
      "💪",
    ],
  },
  {
    id: "activities",
    name: "Activities & Outings",
    icon: <Coffee size={16} />,
    emojis: [
      "☕",
      "🍵",
      "🧋",
      "🍻",
      "🥂",
      "🍷",
      "🍸",
      "🍹",
      "🍕",
      "🍔",
      "🍟",
      "🌭",
      "🍿",
      "🍣",
      "🍜",
      "🍦",
      "🍩",
      "🍰",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎹",
      "🥁",
      "🎸",
      "🎮",
      "🎯",
      "🎳",
      "🏀",
      "⚽",
      "⚾",
      "🎾",
      "🏐",
      "🏓",
      "🏸",
      "🛹",
      "🚴",
      "🧗",
      "🧘",
      "🏊",
      "🏕️",
      "⛺",
      "🏖️",
      "🏔️",
      "🚗",
      "✈️",
      "🚀",
      "🎟️",
      "🎫",
    ],
  },
  {
    id: "hearts",
    name: "Hearts & Vibes",
    icon: <Heart size={16} />,
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❤️‍🔥",
      "❤️‍🩹",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "✨",
      "🌟",
      "⭐",
      "💫",
      "💥",
      "🔥",
      "💯",
      "💬",
      "💭",
      "⚡",
      "🌈",
      "☀️",
      "🌙",
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("popular");
  const [search, setSearch] = useState("");

  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return null;
    const term = search.toLowerCase();
    const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    return Array.from(new Set(all));
  }, [search]);

  return (
    <div className="w-80 rounded-2xl border border-white/10 bg-surface shadow-2xl p-3 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
      {/* Search Input */}
      <div className="relative mb-2.5">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={14}
        />
        <input
          type="text"
          placeholder="Search emojis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
        />
      </div>

      {/* Category Tabs (shown when not searching) */}
      {!search && (
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center justify-center ${
                activeCategory === cat.id
                  ? "bg-primary/20 text-accent font-semibold"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="max-h-52 overflow-y-auto pr-1">
        {search ? (
          <div className="grid grid-cols-7 gap-1">
            {filteredEmojis?.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => onSelect(emoji)}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-90 transition text-xl cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
              {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.name}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-90 transition text-xl cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
