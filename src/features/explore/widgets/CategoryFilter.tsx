const categories = ["All", "Coffee", "Movies", "Travel", "Sports", "Gaming", "Music"];

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="mt-5 flex gap-2 overflow-x-auto">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`rounded-full border px-4 py-2 whitespace-nowrap ${
            value === category ? "bg-primary text-white" : ""
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
