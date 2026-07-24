export interface ExploreOuting {
    id: string;
  
    title: string;
  
    category: string;
  
    location: string;
  
    image: string;
  
    host: string;
  
    rating: number;
  
    date: string;
  
    participants: number;
    joinStatus?:
  | "not_joined"
  | "pending"
  | "accepted"
  | "rejected";
  }