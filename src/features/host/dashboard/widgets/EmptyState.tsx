import { CalendarDays } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card px-8 py-16 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <CalendarDays className="h-10 w-10 text-primary" />
      </div>

      <h2 className="text-xl font-bold">{title}</h2>

      <p className="mt-2 max-w-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}