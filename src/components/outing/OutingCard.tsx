import { Heart, MapPin, CalendarDays, Users, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import OrganizerInfo from "./OrganizerInfo";

import { Outing } from "@/features/home/models/outing";

type OutingCardProps = {
  outing: Outing;

  onJoin?: () => void;

  onSave?: () => void;

  onClick?: () => void;
};

export default function OutingCard({ outing, onJoin, onSave, onClick }: OutingCardProps) {
  return (
    <Card
      className="overflow-hidden rounded-3xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Cover Image */}

      <div className="relative">
        <img src={outing.coverImage} alt={outing.title} className="h-64 w-full object-cover" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md transition hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 ${outing.isSaved ? "fill-red-500 text-red-500" : "text-gray-700"}`}
          />
        </button>
      </div>

      <CardContent className="space-y-5 p-6">
        {/* Match Badge */}

        {outing.matchPercentage && (
          <Badge className="w-fit rounded-full bg-primary/10 text-primary border-primary/20">
            <Sparkles className="mr-1 h-4 w-4" />
            {outing.matchPercentage}% Match
          </Badge>
        )}

        {/* Title */}

        <h2 className="text-2xl font-bold">{outing.title}</h2>

        {/* Description */}

        <p className="line-clamp-2 text-muted-foreground">{outing.description}</p>

        {/* Organizer */}

        <OrganizerInfo
          name={outing.organizer.name}
          avatar={outing.organizer.avatar}
          rating={outing.organizer.rating}
          totalHosted={outing.organizer.totalHosted}
          isVerified={outing.organizer.isVerified}
        />

        {/* Divider */}

        <div className="border-t border-border" />

        {/* Details */}

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />

            <span>{outing.location}</span>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />

            <span>
              {outing.date} • {outing.time}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />

            <span>
              {outing.joined} / {outing.capacity} Joined
            </span>
          </div>
        </div>

        {/* Join Button */}

        <Button
          className="mt-2 w-full rounded-xl"
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
        >
          Join Now
        </Button>
      </CardContent>
    </Card>
  );
}
