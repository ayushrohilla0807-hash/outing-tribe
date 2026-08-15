type PublishButtonProps = {
  loading: boolean;
  disabled?: boolean;
};

export default function PublishButton({ loading, disabled = false }: PublishButtonProps) {
  return (
    <button
      type="submit"
      onClick={() => console.log("🟢 BUTTON CLICKED")}
      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white"
    >
      Create Outing
    </button>
  );
}
