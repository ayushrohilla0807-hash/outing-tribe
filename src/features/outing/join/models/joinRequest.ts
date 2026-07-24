export type JoinStatus =
  | "not_joined"
  | "pending"
  | "accepted"
  | "rejected";

export interface JoinRequest {
  id: string;

  outingId: string;

  userId: string;

  status: JoinStatus;

  requestedAt: string;

  respondedAt?: string;
}