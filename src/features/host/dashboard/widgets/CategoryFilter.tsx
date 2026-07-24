interface Props {
    value: string;
    onChange: (value: string) => void;
  }
  
  const categories = [
    "All",
    "Adventure",
    "Food",
    "Travel",
    "Fitness",
  ];
  
  export default function CategoryFilter({
    value,
    onChange,
  }: Props) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border px-4 py-3"
      >
        {categories.map((category) => (
          <option key={category}>
            {category}
          </option>
        ))}
      </select>
    );
  }