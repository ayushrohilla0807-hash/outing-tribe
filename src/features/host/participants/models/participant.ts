export type ParticipantStatus = "pending" | "accepted";

export interface Participant {
  id: string;
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