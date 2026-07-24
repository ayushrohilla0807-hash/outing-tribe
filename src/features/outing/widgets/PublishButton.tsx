import { Loader2 } from "lucide-react";

type Props = {
  loading: boolean;
  onClick: () => void;
};

export default function PublishButton({
  loading,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {loading && (
        <Loader2 className="h-5 w-5 animate-spin" />
      )}

      {loading ? "Publishing..." : "Publish Outing"}
    </button>
  );
}