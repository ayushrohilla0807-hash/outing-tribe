interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
  }
  
  export default function SearchBar({
    value,
    onChange,
  }: SearchBarProps) {
    return (
      <input
        type="text"
        placeholder="🔍 Search outings..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:border-primary"
      />
    );
  }