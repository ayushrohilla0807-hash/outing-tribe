export type ParticipantStatus = "pending" | "joined";

export interface Participant {
  id: string;
  userId: string;
  outingId: string;

  name: string;
  age: number;
  city: string;

  avatar: string;

  rating: number;

  interests: string[];

  joinedAt: string;

  status: ParticipantStatus;
}
