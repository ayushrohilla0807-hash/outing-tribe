import { interests } from "@/lib/interests";

type InterestSelectorProps = {
  selectedInterests: string[];
  setSelectedInterests: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function InterestSelector({
  selectedInterests,
  setSelectedInterests,
}: InterestSelectorProps) {
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(
        selectedInterests.filter((item) => item !== interest)
      );
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">
        ❤️ Select Your Interests
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Choose at least 3 interests to get better outing recommendations.
      </p>

      <div className="mt-6 space-y-8">
        {interests.map((group) => (
          <div key={group.category}>
            <h3 className="mb-4 text-lg font-semibold">
              {group.category}
            </h3>

            <div className="flex flex-wrap gap-3">
              {group.items.map((interest) => {
                const selected =
                  selectedInterests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-5 py-2 transition-all duration-200 border

                    ${
                      selected
                        ? "bg-primary text-white border-primary"
                        : "bg-white/5 border-white/10 hover:border-primary hover:bg-primary/10"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-primary">
        Selected: {selectedInterests.length}
      </p>
    </div>
  );
}