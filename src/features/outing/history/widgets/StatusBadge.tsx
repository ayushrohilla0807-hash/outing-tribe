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
    label: "Request Pending",
    className: "bg-pending/20 text-pending dark:bg-pending/30 dark:text-pending-foreground",
  },

  joined: {
    label: "Joined",
    className: "bg-success/20 text-success dark:bg-success/30 dark:text-success-foreground",
  },

  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive-foreground",
  },
};

export default function StatusBadge({ status }: Props) {
  const badge = styles[status];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
      {badge.label}
    </span>
  );
}
