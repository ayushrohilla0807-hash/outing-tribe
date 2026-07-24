interface StatCardProps {
    title: string;
    value: number;
  }
  
  export default function StatCard({
    title,
    value,
  }: StatCardProps) {
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">
          {title}
        </p>
  
        <h2 className="mt-2 text-3xl font-bold">
          {value}
        </h2>
      </div>
    );
  }