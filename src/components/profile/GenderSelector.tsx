import { VenusAndMars } from "lucide-react";

type GenderSelectorProps = {
  selectedGender: string;
  onGenderChange: (gender: string) => void;
};

const genders = ["Male", "Female", "Other", "Prefer not to say"];

export default function GenderSelector({ selectedGender, onGenderChange }: GenderSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <VenusAndMars className="h-4 w-4" />
        Gender
      </label>

      <div className="grid grid-cols-2 gap-3">
        {genders.map((gender) => (
          <button
            key={gender}
            type="button"
            onClick={() => onGenderChange(gender)}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200
            ${
              selectedGender === gender
                ? "border-primary bg-primary text-white shadow-lg"
                : "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10"
            }`}
          >
            {gender}
          </button>
        ))}
      </div>
    </div>
  );
}
