import { Calendar, MapPin, Star, Users } from "lucide-react";

import SaveButton from "@/features/outing/saved/widgets/SaveButton";
import JoinButton from "@/features/outing/join/widgets/JoinButton";

import { Avatar, AvatarFallback, AvatarImage } from "../common/Avatar";

type JoinStatus = "none" | "pending" | "joined";

type Props = {
  id: string;

  image: string;

  title: string;
  category: string;

  location: string;
  date: string;

  host: string;
  hostAvatar?: string;

  rating: number;

  joinedCount: number;
  capacity: number;

  saved: boolean;

  status: JoinStatus;

  loading?: boolean;

  onCardClick?: () => void;
  onSave: () => void;
  onJoin: () => void;
};

export default function OutingCard({
  image,
  title,
  category,
  location,
  date,
  host,
  hostAvatar,
  rating,
  joinedCount,
  capacity,
  saved,
  status,
  loading = false,
  onCardClick,
  onSave,
  onJoin,
}: Props) {
  return (
    <div
      onClick={onCardClick}
      className="overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
      <div className="relative">
        <img src={image} alt={title} className="h-56 w-full object-cover" />

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          <SaveButton saved={saved} onClick={() => {}} />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {category}
          </span>

          <div className="flex items-center gap-1">
            <Star size={16} className="fill-pending text-pending" />

            <span className="font-medium">{rating}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold">{title}</h2>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              {joinedCount}/{capacity} Joined
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={hostAvatar} />

              <AvatarFallback>{host.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-semibold">{host}</p>

              <p className="text-xs text-muted-foreground">Organizer</p>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <JoinButton status={status} loading={loading} onJoin={onJoin} onLeave={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
