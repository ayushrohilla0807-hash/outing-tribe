export type JoinStatus = "none" | "pending" | "joined";

export interface JoinRequest {
  id: string;
  outingId: string;
  userId: string;
  status: JoinStatus;
  requestedAt: string;
  respondedAt?: string;
}
