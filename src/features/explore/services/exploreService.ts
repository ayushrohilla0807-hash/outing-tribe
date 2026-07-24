import type { ExploreOuting } from "../models/outing";

export async function getExploreOutings(): Promise<
  ExploreOuting[]
> {
  return [
    {
      id: "2",

      title: "Coffee Meetup",

      category: "Coffee",

      location: "Connaught Place",

      image:
        "https://images.unsplash.com/photo-1445116572660-236099ec97a0",

      host: "Ayush",

      rating: 4.9,

      date: "Tomorrow • 5 PM",

      participants: 3,
    },

    {
      id: "3",

      title: "Movie Night",

      category: "Movies",

      location: "PVR Saket",

      image:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",

      host: "Riya",

      rating: 4.8,

      date: "Saturday",

      participants: 5,
    },
  ];
}