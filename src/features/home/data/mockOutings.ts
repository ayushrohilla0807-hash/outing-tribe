import { Outing } from "../models/outing";

export const mockOutings: Outing[] = [
  {
    id: "1",

    title: "Cafe Hopping",

    description:
      "Explore hidden cafés and meet fellow coffee lovers.",

    coverImage:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",

    location: "Connaught Place",

    date: "Today",

    time: "6:00 PM",

    joined: 3,

    capacity: 8,

    isSaved: false,

    matchPercentage: 96,

    organizer: {
      id: "101",

      name: "Sanya Sharma",

      avatar:
        "https://i.pravatar.cc/150?img=5",

      rating: 4.9,

      totalHosted: 27,

      isVerified: true,
    },
  },
];