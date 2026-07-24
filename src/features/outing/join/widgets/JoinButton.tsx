import type { JoinStatus } from "../hooks/useJoinRequest";

type Props = {
  status: JoinStatus;
  onJoin: () => void;
  onCancel: () => void;
  onOpenChat?: () => void;
};

export default function JoinButton({
  status,
  onJoin,
  onCancel,
  onOpenChat,
}: Props) {
  switch (status) {
    case "pending":
      return (
        <button
          onClick={onCancel}
          className="rounded-full bg-yellow-500 px-5 py-2 font-medium text-black"
        >
          Cancel Request
        </button>
      );

    case "accepted":
      return (
        <button
          onClick={onOpenChat}
          className="rounded-full bg-green-600 px-5 py-2 font-medium text-white"
        >
          Open Chat
        </button>
      );

    case "rejected":
      return (
        <button
          onClick={onJoin}
          className="rounded-full bg-red-500 px-5 py-2 font-medium text-white"
        >
          Join Again
        </button>
      );

    default:
      return (
        <button
          onClick={onJoin}
          className="rounded-full bg-primary px-5 py-2 text-white"
        >
          Join
        </button>
      );
  }
}