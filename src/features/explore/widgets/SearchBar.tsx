import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative">

      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2"
        size={18}
      />

      <input
        placeholder="Search outings..."
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-full border py-3 pl-11 pr-4"
      />

    </div>
  );
}