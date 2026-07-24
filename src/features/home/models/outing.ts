export interface Organizer {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalHosted: number;
    isVerified: boolean;
  }
  
  export interface Outing {
    id: string;
  
    title: string;
  
    description: string;
  
    coverImage: string;
  
    location: string;
  
    date: string;
  
    time: string;
  
    joined: number;
  
    capacity: number;
  
    organizer: Organizer;
  
    isSaved: boolean;
  
    matchPercentage?: number;
  }