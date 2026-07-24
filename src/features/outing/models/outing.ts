export interface Outing {
    id: string;
  
    title: string;
  
    description: string;
  
    category: string;
  
    coverImage: string;
  
    location: string;
  
    date: string;
  
    time: string;
  
    maxParticipants: number;
  
    price?: number;
  
    minAge?: number;
  
    interests: string[];
  }