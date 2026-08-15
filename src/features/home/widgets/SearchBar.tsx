import { Search, SlidersHorizontal } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
};

export default function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
        <Search className="text-muted-foreground" size={22} />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search outings, cafés, movies..."
          className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
        />

        <button
          type="button"
          onClick={onFilterClick}
          className="rounded-xl p-2 transition hover:bg-primary hover:text-white"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
