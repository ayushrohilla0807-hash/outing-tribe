import indianStates from "@/lib/indianStates";
import { MapPinned } from "lucide-react";

type StateDropdownProps = {
  selectedState: string;
  onStateChange: (state: string) => void;
};

export default function StateDropdown({ selectedState, onStateChange }: StateDropdownProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <MapPinned className="h-4 w-4" />
        State
      </label>

      <select
        value={selectedState}
        onChange={(e) => onStateChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 outline-none transition focus:border-primary"
      >
        <option value="">Select your state</option>

        {indianStates.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
    </div>
  );
}
