export interface DashboardStats {
    hosted: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    participants: number;
  }
  
  export function getDashboardStats(): DashboardStats {
    return {
      hosted: 12,
      upcoming: 2,
      completed: 8,
      cancelled: 2,
      participants: 164,
    };
  }