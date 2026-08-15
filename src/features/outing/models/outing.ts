export interface Outing {
  id: string;

  title: string;

  description: string;

  category: string;

  coverImage: string;

  location: string;

  city: string;

  outingDate: string;

  startTime: string;

  endTime?: string | null;

  participantCount: number;

  maxParticipants: number;

  hostId: string;

  hostName: string;

  hostAvatar?: string;

  rating: number;

  joined: boolean;
}
