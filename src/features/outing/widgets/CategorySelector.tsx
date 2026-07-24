const categories = [
    "Coffee",
    "Movies",
    "Travel",
    "Sports",
    "Gaming",
    "Music",
    "Fitness",
    "Food",
    "Photography",
  ];
  
  type Props = {
    value: string;
    onChange: (v: string) => void;
  };
  
  export default function CategorySelector({
    value,
    onChange,
  }: Props) {
    return (
      <div className="space-y-3">
  
        <label className="font-medium">
          Category
        </label>
  
        <div className="flex flex-wrap gap-2">
  
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`rounded-full border px-4 py-2 ${
                value === category
                  ? "bg-primary text-white"
                  : ""
              }`}
            >
              {category}
            </button>
          ))}
  
        </div>
  
      </div>
    );
  }