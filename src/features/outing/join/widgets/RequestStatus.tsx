import type { JoinStatus } from "../models/joinRequest";

type Props = {
  status: JoinStatus;
};

export default function RequestStatus({
  status,
}: Props) {
  if (status === "pending") {
    return (
      <p className="mt-3 text-sm text-yellow-500">
        ⏳ Waiting for host approval
      </p>
    );
  }

  if (status === "accepted") {
    return (
      <p className="mt-3 text-sm text-green-500">
        ✅ You're part of this outing
      </p>
    );
  }

  if (status === "rejected") {
    return (
      <p className="mt-3 text-sm text-red-500">
        ❌ Your request was rejected
      </p>
    );
  }

  return null;
}