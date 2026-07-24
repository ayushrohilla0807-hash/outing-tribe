import type { HistoryStatus } from "../models/history";

type Props = {
  status: HistoryStatus;
};

const styles: Record<
  HistoryStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },

  accepted: {
    label: "Accepted",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },

  completed: {
    label: "Completed",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

export default function StatusBadge({
  status,
}: Props) {
  const badge = styles[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}