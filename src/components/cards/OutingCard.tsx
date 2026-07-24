import SaveButton from "@/features/outing/saved/widgets/SaveButton";
import { useSaved } from "@/features/outing/saved/context/SavedContext";
import JoinButton from "@/features/outing/join/widgets/JoinButton";
import {
  Calendar,
  MapPin,
  Star,
  Users,
} from "lucide-react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../common/Avatar";

import type { JoinStatus } from "@/features/outing/join/hooks/useJoinRequest";

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
  joined: number;
  capacity: number;

  status?: JoinStatus;

  onJoin?: () => void;
  onCancel?: () => void;
  onOpenChat?: () => void;
};

export default function OutingCard({
  id,
  image,
  title,
  category,
  location,
  date,
  host,
  hostAvatar,
  rating,
  joined,
  capacity,
  status = "not_joined",
  onJoin,
  onCancel,
  onOpenChat,
}: Props) {
  const { isSaved, toggleSaved } = useSaved();

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:-translate-y-1">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="h-56 w-full object-cover"
        />

        <SaveButton
          saved={isSaved(id)}
          onClick={() =>
            toggleSaved({
              id,
              title,
              image,
              category,
              location,
              date,
              host,
              hostAvatar,
              rating,
              joined,
              capacity,
            })
          }
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {category}
          </span>

          <div className="flex items-center gap-1">
            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />
            <span>{rating}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            {location}
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} />
            {date}
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} />
            {joined}/{capacity} Joined
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={hostAvatar} />
              <AvatarFallback>
                {host.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-semibold">
                {host}
              </p>

              <p className="text-xs text-muted-foreground">
                Organizer
              </p>
            </div>
          </div>

          <JoinButton
            status={status}
            onJoin={() => onJoin?.()}
            onCancel={() => onCancel?.()}
            onOpenChat={() => onOpenChat?.()}
          />
        </div>
      </div>
    </div>
  );
}