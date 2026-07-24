import JoinButton from "@/features/outing/join/widgets/JoinButton";
import SaveButton from "@/features/outing/saved/widgets/SaveButton";
import { useSaved } from "@/features/outing/saved/context/SavedContext";

import {
  Calendar,
  MapPin,
  Star,
  Users,
} from "lucide-react";

import type { ExploreOuting } from "../models/outing";

type Props = {
  outing: ExploreOuting & {
    onJoin?: () => void;
    onCancel?: () => void;
  };
};

export default function OutingCard({
  outing,
}: Props) {
  const { isSaved, toggleSaved } = useSaved();

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">

      <div className="relative">
        <img
          src={outing.image}
          alt={outing.title}
          className="h-52 w-full object-cover"
        />

        <SaveButton
          saved={isSaved(outing.id)}
          onClick={() =>
            toggleSaved({
              id: outing.id,
              title: outing.title,
              image: outing.image,
              category: outing.category,
              location: outing.location,
              date: outing.date,
              host: outing.host,
              rating: outing.rating,
              joined: outing.participants,
              capacity: outing.participants,
            })
          }
        />
      </div>

      <div className="space-y-3 p-5">

        <div className="flex items-center justify-between">

          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {outing.category}
          </span>

          <div className="flex items-center gap-1">

            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="text-sm font-medium">
              {outing.rating}
            </span>

          </div>

        </div>

        <h2 className="text-xl font-bold">
          {outing.title}
        </h2>

        <div className="space-y-2 text-sm text-muted-foreground">

          <div className="flex items-center gap-2">
            <MapPin size={16} />
            {outing.location}
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} />
            {outing.date}
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} />
            Needs {outing.participants} people
          </div>

        </div>

        <div className="flex items-center justify-between pt-2">

          <span className="font-medium">
            Hosted by {outing.host}
          </span>

          <JoinButton
            status={outing.joinStatus ?? "not_joined"}
            onJoin={() => outing.onJoin?.()}
            onCancel={() => outing.onCancel?.()}
            onOpenChat={() => {
              window.location.href = `/chats/${outing.id}`;
            }}
          />

        </div>

      </div>

    </div>
  );
}