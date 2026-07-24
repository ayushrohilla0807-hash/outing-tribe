import type { UserProfile } from "../models/profile";

export async function getProfile(): Promise<UserProfile> {
  return {
    id: "1",

    name: "Ayush",

    email: "ayush@gmail.com",

    phone: "+91 9876543210",

    age: 20,

    gender: "Male",

    state: "Delhi",

    city: "Delhi",

    bio: "Always down for a café hunt ☕ and movie night 🎬",

    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",

    interests: [
      "Movies",
      "Coffee",
      "Travel",
      "Tech",
      "Sports",
    ],

    hostRating: 4.9,

    hostedCount: 12,

    joinedCount: 31,

    savedCount: 8,

    verified: true,
  };
}