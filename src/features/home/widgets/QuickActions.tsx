import { PlusCircle, MapPin, Heart, Dice5 } from "lucide-react";

type QuickActionsProps = {
  onCreate: () => void;
  onNearby: () => void;
  onSaved: () => void;
  onSurprise: () => void;
};

export default function QuickActions({
  onCreate,
  onNearby,
  onSaved,
  onSurprise,
}: QuickActionsProps) {
  const actions = [
    {
      title: "Create",
      icon: PlusCircle,
      onClick: onCreate,
    },
    {
      title: "Nearby",
      icon: MapPin,
      onClick: onNearby,
    },
    {
      title: "Saved",
      icon: Heart,
      onClick: onSaved,
    },
    {
      title: "Surprise",
      icon: Dice5,
      onClick: onSurprise,
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>

      <div className="grid grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-primary hover:bg-primary/10"
            >
              <Icon size={28} className="mb-2 text-primary" />

              <span className="text-sm font-medium">{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
