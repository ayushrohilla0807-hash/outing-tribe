type PublishButtonProps = {
  loading: boolean;
  disabled?: boolean;
};

export default function PublishButton({ loading, disabled = false }: PublishButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-black shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
    >
      {loading ? "Creating Outing..." : "Create Outing"}
    </button>
  );
}
