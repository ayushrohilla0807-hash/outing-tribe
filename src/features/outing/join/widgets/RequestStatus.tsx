import type { JoinStatus } from "../models/joinRequest";

type Props = {
  status: JoinStatus;
};

export default function RequestStatus({ status }: Props) {
  if (status === "pending") {
    return <p className="mt-3 text-sm text-yellow-500 font-medium">⏳ Waiting for host approval</p>;
  }

  if (status === "joined") {
    return (
      <p className="mt-3 text-sm text-emerald-500 font-medium">✅ You're joined in this outing</p>
    );
  }

  return null;
}
