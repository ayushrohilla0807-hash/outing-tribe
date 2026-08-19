import { Loader2, PlusCircle } from "lucide-react";

type PublishButtonProps = {
  loading: boolean;
  disabled?: boolean;
};

export default function PublishButton({ loading, disabled = false }: PublishButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-glow transition-all hover:bg-primary/95 active:scale-98 disabled:opacity-50 cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Publishing Outing...</span>
        </>
      ) : (
        <>
          <PlusCircle className="h-5 w-5 stroke-[2.2]" />
          <span>Publish Outing</span>
        </>
      )}
    </button>
  );
}
