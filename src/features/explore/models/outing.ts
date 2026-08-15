export interface ExploreOuting {
  id: string;

  title: string;
  description?: string;

  category: string;

  image: string;

  location: string;
  city?: string;

  hostId?: string;
  host: string;
  avatar?: string;

  rating: number;

  date: string;
  outingDate?: string;
  startTime?: string;
  endTime?: string | null;

  participants: number;
  maxParticipants: number;

  joined?: boolean;
}
