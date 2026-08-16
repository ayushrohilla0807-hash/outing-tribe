type JoinStatus = "none" | "pending" | "joined";

type Props = {
  status: JoinStatus;
  loading?: boolean;
  onJoin: () => void;
  onLeave: () => void;
};

export default function JoinButton({ status, loading = false, onJoin }: Props) {
  function handleClick() {
    if (loading || status !== "none") return;

    onJoin();
  }

  const buttonText = loading
    ? "Loading..."
    : status === "pending"
      ? "Request Sent"
      : status === "joined"
        ? "Joined"
        : "Join";

  const buttonClass =
    status === "joined"
      ? "bg-success text-success-foreground cursor-not-allowed"
      : status === "pending"
        ? "bg-pending text-pending-foreground cursor-not-allowed"
        : "bg-primary text-primary-foreground hover:bg-primary-glow";

  return (
    <button
      disabled={loading || status !== "none"}
      onClick={handleClick}
      className={`rounded-full px-5 py-2 font-medium transition ${buttonClass} ${
        loading ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {buttonText}
    </button>
  );
}
