import { Star, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type OrganizerInfoProps = {
  name: string;
  avatar: string;
  rating: number;
  totalHosted: number;
  isVerified: boolean;
};

export default function OrganizerInfo({
  name,
  avatar,
  rating,
  totalHosted,
  isVerified,
}: OrganizerInfoProps) {
  return (
    <div className="flex items-center justify-between py-2">
      {/* Left Section */}

      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-base">{name}</h3>

            {isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
          </div>

          <p className="text-sm text-muted-foreground">Hosted {totalHosted} outings</p>
        </div>
      </div>

      {/* Right Section */}

      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    </div>
  );
}
