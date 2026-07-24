export interface EditOutingData {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    image: string;
  }
  
  const outings: EditOutingData[] = [
    {
      id: "1",
      title: "Weekend Trek",
      description:
        "Join us for an adventurous trek with amazing views.",
      category: "Adventure",
      date: "2026-07-26",
      time: "08:00",
      location: "Delhi Ridge",
      capacity: 25,
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
    },
  ];
  
  export function getOuting(id: string) {
    return outings.find((outing) => outing.id === id);
  }
  
  export function updateOuting(updated: EditOutingData) {
    const index = outings.findIndex(
      (outing) => outing.id === updated.id
    );
  
    if (index !== -1) {
      outings[index] = updated;
    }
  
    return updated;
  }