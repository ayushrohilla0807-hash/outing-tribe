import { Loader2, ArrowRight } from "lucide-react";

type ContinueButtonProps = {
  loading: boolean;
  onClick: () => void;
};

export default function ContinueButton({
  loading,
  onClick,
}: ContinueButtonProps) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          Continue
          <ArrowRight className="h-5 w-5" />
        </>
      )}
    </button>
  );
}