export type NotificationType =
  | "join_request"
  | "accepted"
  | "reminder"
  | "message";

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: NotificationType;
}