import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProfileHeaderProps = {
  onSettingsClick: () => void;
};

export default function ProfileHeader({ onSettingsClick }: ProfileHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

        <p className="mt-1 text-sm text-muted-foreground">Manage your account and outings</p>
      </div>

      <Button variant="outline" size="icon" onClick={onSettingsClick} className="rounded-full">
        <Settings className="h-5 w-5" />
      </Button>
    </header>
  );
}
