import { Switch } from "@/components/ui/switch";
import {
    Moon,
    Bell,
    User,
    MapPin,
    Shield,
    LogOut,
    X,
  } from "lucide-react";
  
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
        className="flex w-full items-center justify-between rounded-xl p-4 hover:bg-muted"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
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
    return (
      <>
        {open && (
          <div
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
        )}
  
        <aside
          className={`fixed right-0 top-0 z-50 h-screen w-80 bg-background shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b p-5">
  
            <h2 className="text-xl font-bold">
              Settings
            </h2>
  
            <button onClick={onClose}>
              <X />
            </button>
  
          </div>
  
          <div className="space-y-2 p-4">
  
            <Row
              icon={<User />}
              title="Edit Profile"
              onClick={onEditProfile}
            />
  
            <Row
            icon={<Moon className="h-5 w-5" />}
            title="Dark Mode"
            right={
                <Switch
                checked={darkMode}
                onCheckedChange={onDarkMode}
                />
            }
            />
  
            <Row
            icon={<Bell className="h-5 w-5" />}
            title="Notifications"
            right={
                <Switch
                checked={true}
                onCheckedChange={() => {}}
                />
            }
            />
  
            <Row
              icon={<MapPin />}
              title="Location"
            />
  
            <Row
              icon={<Shield />}
              title="Privacy Policy"
            />
  
            <Row
              icon={<LogOut />}
              title="Logout"
              onClick={onLogout}
            />
  
          </div>
  
        </aside>
      </>
    );
  }