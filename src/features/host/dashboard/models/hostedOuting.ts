export type HostedOutingStatus = "upcoming" | "completed" | "cancelled";

export type HostedOuting = {
  id: string;
  title: string;
  category: string;
  image: string;
  location: string;
  date: string;
  time: string;
  joined: number;
  pending: number;
  capacity: number;
  status: HostedOutingStatus;
};
