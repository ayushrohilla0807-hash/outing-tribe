import { Minus, Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { CreateOutingForm } from "../schema";

export default function ParticipantsStepper() {
  const { watch, setValue } = useFormContext<CreateOutingForm>();

  const participants = watch("participants");

  function decrease() {
    if (participants > 1) {
      setValue("participants", participants - 1, {
        shouldValidate: true,
      });
    }
  }

  function increase() {
    if (participants < 50) {
      setValue("participants", participants + 1, {
        shouldValidate: true,
      });
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold">Maximum Participants</label>

      <div className="flex items-center justify-between rounded-xl border p-3">
        <button
          type="button"
          onClick={decrease}
          className="rounded-lg border p-2 transition hover:bg-muted"
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className="text-2xl font-bold">{participants}</span>

        <button
          type="button"
          onClick={increase}
          className="rounded-lg border p-2 transition hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">Allowed: 1–50 participants</p>
    </div>
  );
}
