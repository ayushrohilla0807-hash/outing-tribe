import type { Chat } from "../models/message";

export const mockChats: Chat[] = [
  {
    outingId: "1",
    otherUserId: "host-1",
    outingName: "Cafe Hopping",
    outingImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    otherUserName: "Sanya",
    otherUserAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    lastMessage: "See you all at 6 PM ☕",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    participants: 8,
  },
  {
    outingId: "2",
    otherUserId: "host-2",
    outingName: "Movie Night",
    outingImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
    otherUserName: "Alex",
    otherUserAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    lastMessage: "Booked the tickets 🎟️",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    participants: 5,
  },
  {
    outingId: "3",
    otherUserId: "host-3",
    outingName: "Sunday Trek",
    outingImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    otherUserName: "Priya",
    otherUserAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    lastMessage: "",
    lastMessageTime: "",
    unreadCount: 0,
    participants: 10,
  },
];
