import type { HostedOuting } from "../models/hostedOuting";

const outings: HostedOuting[] = [
  {
    id: "1",
    title: "Weekend Trek",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",

    location: "Delhi Ridge",

    date: "26 July 2026",
    time: "8:00 AM",

    joined: 18,
    capacity: 25,

    status: "upcoming",
  },

  {
    id: "2",
    title: "Cafe Hopping",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200",

    location: "Connaught Place",

    date: "28 July 2026",
    time: "5:00 PM",

    joined: 12,
    capacity: 15,

    status: "upcoming",
  },

  {
    id: "3",
    title: "Morning Cycling",
    category: "Fitness",
    image:
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1200",

    location: "India Gate",

    date: "18 July 2026",
    time: "6:30 AM",

    joined: 20,
    capacity: 20,

    status: "completed",
  },

  {
    id: "4",
    title: "Movie Night",
    category: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",

    location: "Select City Walk",

    date: "15 July 2026",
    time: "7:30 PM",

    joined: 9,
    capacity: 15,

    status: "cancelled",
  },
];

export function getHostedOutings() {
    return outings;
  }