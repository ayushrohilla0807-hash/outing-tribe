import type { Notification } from "../models/notification";

export function getNotifications(): Notification[] {
  return [
    {
      id: "1",
      title: "New Join Request",
      description: "Rahul requested to join Weekend Trek.",
      time: "5 min ago",
      read: false,
      type: "join_request",
    },
    {
      id: "2",
      title: "Request Accepted",
      description: "Aman accepted your invitation.",
      time: "20 min ago",
      read: true,
      type: "accepted",
    },
    {
      id: "3",
      title: "Upcoming Outing",
      description: "Weekend Trek starts tomorrow.",
      time: "1 hour ago",
      read: false,
      type: "reminder",
    },
    {
      id: "4",
      title: "New Message",
      description: "Priya sent you a message.",
      time: "2 hours ago",
      read: true,
      type: "message",
    },
  ];
}