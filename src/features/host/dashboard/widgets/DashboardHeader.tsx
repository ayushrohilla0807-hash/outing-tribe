type DashboardHeaderProps = {
    totalOutings: number;
  };
  
  export default function DashboardHeader({
    totalOutings,
  }: DashboardHeaderProps) {
    return (
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Host Dashboard
        </h1>
  
        <p className="mt-2 text-muted-foreground">
          Manage your outings, participants, and upcoming events.
        </p>
  
        <div className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          {totalOutings} Outing{totalOutings !== 1 ? "s" : ""}
        </div>
      </div>
    );
  }