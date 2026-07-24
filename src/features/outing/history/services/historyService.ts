import type { HistoryOuting } from "../models/history";

const data: HistoryOuting[] = [
  {
    id: "1",
    title: "Sunday Trek",
    location: "Delhi",
    date: "20 Jul 2026",
    host: "Rahul",
    image: "https://picsum.photos/500/300?1",
    status: "completed",
    participants: 18,
  },
  {
    id: "2",
    title: "Movie Night",
    location: "Noida",
    date: "24 Jul 2026",
    host: "Ananya",
    image: "https://picsum.photos/500/300?2",
    status: "pending",
    participants: 9,
  },
  {
    id: "3",
    title: "Coffee Meetup",
    location: "Gurgaon",
    date: "27 Jul 2026",
    host: "Aman",
    image: "https://picsum.photos/500/300?3",
    status: "accepted",
    participants: 12,
  },
  {
    id: "4",
    title: "Dinner Meetup",
    location: "Delhi",
    date: "18 Jul 2026",
    host: "Riya",
    image: "https://picsum.photos/500/300?4",
    status: "cancelled",
    participants: 7,
  },
];

export async function getHistory() {
  return Promise.resolve(data);
}