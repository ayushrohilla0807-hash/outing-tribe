import { Badge } from "@/components/ui/badge";

type InterestsSectionProps = {
  interests: string[];
};

export default function InterestsSection({ interests }: InterestsSectionProps) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-lg font-semibold">Interests</h3>

      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <Badge key={interest} variant="secondary" className="rounded-full px-4 py-2 text-sm">
            {interest}
          </Badge>
        ))}
      </div>
    </section>
  );
}
