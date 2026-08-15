import { Chat } from "../models/message";

export const mockChats: Chat[] = [
  {
    id: "1",
    outingId: "1",

    outingName: "Cafe Hopping",

    outingImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",

    status: "accepted",

    lastMessage: "See you all at 6 PM ☕",

    lastMessageTime: "2m",

    unreadCount: 2,

    participants: 8,

    messages: [
      {
        id: "1",
        senderId: "host",
        senderName: "Sanya",
        text: "Hey everyone 👋",
        sentAt: "5:40 PM",
        isMine: false,
      },
      {
        id: "2",
        senderId: "me",
        senderName: "Me",
        text: "I'll reach in 15 minutes.",
        sentAt: "5:43 PM",
        isMine: true,
      },
      {
        id: "3",
        senderId: "host",
        senderName: "Sanya",
        text: "Perfect 👍",
        sentAt: "5:44 PM",
        isMine: false,
      },
    ],
  },

  {
    id: "2",
    outingId: "2",

    outingName: "Movie Night",

    outingImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",

    status: "accepted",

    lastMessage: "Booked the tickets 🎟️",

    lastMessageTime: "Yesterday",

    unreadCount: 0,

    participants: 5,

    messages: [],
  },

  {
    id: "3",
    outingId: "3",

    outingName: "Sunday Trek",

    outingImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",

    status: "pending",

    lastMessage: "",

    lastMessageTime: "",

    unreadCount: 0,

    participants: 10,

    messages: [],
  },
];
