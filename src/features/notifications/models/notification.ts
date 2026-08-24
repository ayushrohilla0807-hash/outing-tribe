export type NotificationType =
  "join_request" | "accepted" | "rejected" | "reminder" | "message" | "outing_created";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  time: string;
  read: boolean;
  type: NotificationType;
  outingId?: string;
  link?: string;
}
