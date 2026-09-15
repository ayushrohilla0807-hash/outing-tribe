import { Switch } from "@/components/ui/switch";
import { Moon, Bell, User, MapPin, Shield, FileText, LogOut, X, Download } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { usePwaInstall } from "@/hooks/usePwaInstall";

type Props = {
  open: boolean;
  darkMode: boolean;
  onClose: () => void;
  onDarkMode: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
};

function Row({
  icon,
  title,
  right,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl p-4 hover:bg-muted cursor-pointer transition text-foreground"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>

      {right}
    </button>
  );
}

export default function SettingsDrawer({
  open,
  darkMode,
  onClose,
  onDarkMode,
  onEditProfile,
  onLogout,
}: Props) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { canInstall, installApp } = usePwaInstall();

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40" />}

      <aside
        className={`fixed right-0 top-0 z-50 h-screen w-80 bg-background shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="text-xl font-bold text-foreground">Settings</h2>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 p-4">
          <Row icon={<User className="h-5 w-5" />} title="Edit Profile" onClick={onEditProfile} />

          {canInstall && (
            <Row
              icon={<Download className="h-5 w-5 text-primary" />}
              title="Install App"
              right={
                <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-xs font-semibold text-primary">
                  Install
                </span>
              }
              onClick={async () => {
                const installed = await installApp();
                if (installed) onClose();
              }}
            />
          )}

          <Row
            icon={<Moon className="h-5 w-5" />}
            title="Dark Mode"
            right={<Switch checked={darkMode} onCheckedChange={onDarkMode} />}
          />

          <Row
            icon={<Bell className="h-5 w-5" />}
            title="Notifications"
            right={
              unreadCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              ) : null
            }
            onClick={() => {
              onClose();
              navigate({ to: "/notifications" });
            }}
          />

          <Row icon={<MapPin className="h-5 w-5" />} title="Location" />

          <Row
            icon={<Shield className="h-5 w-5" />}
            title="Privacy Policy"
            onClick={() => {
              onClose();
              navigate({ to: "/privacy" });
            }}
          />

          <Row
            icon={<FileText className="h-5 w-5" />}
            title="Terms & Conditions"
            onClick={() => {
              onClose();
              navigate({ to: "/terms" });
            }}
          />

          <Row
            icon={<LogOut className="h-5 w-5 text-destructive" />}
            title="Logout"
            onClick={onLogout}
          />
        </div>
      </aside>
    </>
  );
}
