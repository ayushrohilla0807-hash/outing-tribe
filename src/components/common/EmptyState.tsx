import { SearchX } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
};

export default function EmptyState({
  title,
  subtitle,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24">

      <SearchX
        size={48}
        className="mb-4 text-muted-foreground"
      />

      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-2 text-center text-muted-foreground">
        {subtitle}
      </p>

    </div>
  );
}