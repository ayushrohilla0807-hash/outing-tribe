import { Bookmark, Clock3, LayoutDashboard, LogOut, ChevronRight } from "lucide-react";

type MenuListProps = {
  onSaved: () => void;
  onHistory: () => void;
  onHostDashboard: () => void;
  onLogout: () => void;
};

function MenuItem({
  icon,
  title,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 transition hover:bg-muted/50 ${
        danger ? "text-red-500" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{title}</span>
      </div>

      {!danger && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </button>
  );
}

export default function MenuList({ onSaved, onHistory, onHostDashboard, onLogout }: MenuListProps) {
  return (
    <section className="mt-8 space-y-3">
      <MenuItem title="Saved Outings" icon={<Bookmark size={20} />} onClick={onSaved} />

      <MenuItem title="History" icon={<Clock3 size={20} />} onClick={onHistory} />

      <MenuItem
        title="Host Dashboard"
        icon={<LayoutDashboard size={20} />}
        onClick={onHostDashboard}
      />

      <MenuItem title="Logout" icon={<LogOut size={20} />} danger onClick={onLogout} />
    </section>
  );
}
