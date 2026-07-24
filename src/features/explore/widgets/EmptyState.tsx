import { SearchX } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">

      <SearchX
        size={48}
        className="mb-4 text-muted-foreground"
      />

      <h2 className="text-xl font-semibold">
        No outings found
      </h2>

      <p className="mt-2 text-muted-foreground">
        Try changing your search or category.
      </p>

    </div>
  );
}