import { SlidersHorizontal } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function FilterButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border p-3 transition hover:bg-muted"
    >
      <SlidersHorizontal size={18} />
    </button>
  );
}