import type { HostedOutingStatus } from "../models/hostedOuting";

type StatusTabsProps = {
  selected: HostedOutingStatus;
  onChange: (status: HostedOutingStatus) => void;
};

const tabs: {
  label: string;
  value: HostedOutingStatus;
}[] = [
  {
    label: "Upcoming",
    value: "upcoming",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

export default function StatusTabs({ selected, onChange }: StatusTabsProps) {
  return (
    <div className="mb-6 flex gap-3 overflow-x-auto">
      {tabs.map((tab) => {
        const active = selected === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
