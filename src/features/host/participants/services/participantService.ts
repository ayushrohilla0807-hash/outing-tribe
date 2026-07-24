import type { Participant } from "../models/participant";

const participants: Participant[] = [
  {
    id: "1",
    outingId: "1",
    name: "Rahul Sharma",
    age: 23,
    city: "Delhi",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    rating: 4.8,
    interests: ["Hiking", "Photography", "Travel"],
    joinedAt: "2 hours ago",
    status: "pending",
  },

  {
    id: "2",
    outingId: "1",
    name: "Priya Verma",
    age: 22,
    city: "Noida",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    rating: 4.9,
    interests: ["Adventure", "Nature"],
    joinedAt: "5 hours ago",
    status: "pending",
  },

  {
    id: "3",
    outingId: "1",
    name: "Aman Singh",
    age: 24,
    city: "Gurgaon",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    rating: 4.7,
    interests: ["Cycling", "Fitness"],
    joinedAt: "Yesterday",
    status: "accepted",
  },

  {
    id: "4",
    outingId: "1",
    name: "Sneha Kapoor",
    age: 21,
    city: "Delhi",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    rating: 4.9,
    interests: ["Cafe", "Movies"],
    joinedAt: "Yesterday",
    status: "accepted",
  },
];

export function getParticipants(outingId: string) {
  return participants.filter(
    (participant) => participant.outingId === outingId
  );
}