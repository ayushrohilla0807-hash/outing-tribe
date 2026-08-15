import { Bookmark } from "lucide-react";

type Props = {
  saved: boolean;
  onClick: () => void;
};

export default function SaveButton({ saved, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md transition hover:scale-110"
    >
      <Bookmark size={20} className={saved ? "fill-primary text-primary" : "text-gray-700"} />
    </button>
  );
}
