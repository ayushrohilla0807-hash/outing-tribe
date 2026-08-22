import { BadgeCheck, MapPin, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { UserProfile } from "../models/profile";

type Props = {
  profile: UserProfile;
};

export default function ProfileCard({ profile }: Props) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col items-center">
        <Avatar className="h-28 w-28 border-2 border-white/10 shadow-lg">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />

          <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>

        <div className="mt-4 flex items-center gap-2">
          <h2 className="text-2xl font-bold">{profile.name}</h2>

          {profile.verified && <BadgeCheck className="h-6 w-6 text-primary" />}
        </div>

        <p className="mt-2 text-center text-muted-foreground">{profile.bio}</p>

        <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {profile.city}, {profile.state}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <Star className="h-4 w-4 fill-pending text-pending" />

          <span className="font-semibold">{profile.hostRating}</span>

          <span className="text-sm text-muted-foreground">Host Rating</span>
        </div>
      </div>
    </div>
  );
}
