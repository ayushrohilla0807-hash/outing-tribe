export type HistoryStatus = "pending" | "joined" | "completed" | "cancelled";

export interface HistoryOuting {
  id: string;
  title: string;
  location: string;
  date: string;
  host: string;
  image: string;
  status: HistoryStatus;
  participants: number;
}
