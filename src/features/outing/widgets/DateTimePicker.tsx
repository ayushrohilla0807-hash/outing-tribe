import { CalendarDays, Clock } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { CreateOutingForm } from "../schema";

export default function DateTimePicker() {
  const { register } = useFormContext<CreateOutingForm>();

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5">
      <label className="text-sm font-semibold">Date & Time</label>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <CalendarDays className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

          <input
            type="date"
            min={today}
            {...register("date")}
            className="w-full rounded-xl border py-3 pl-10 pr-4"
          />
        </div>

        <div className="relative">
          <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

          <input
            type="time"
            {...register("startTime")}
            className="w-full rounded-xl border py-3 pl-10 pr-4"
          />
        </div>

        <div className="relative">
          <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

          <input
            type="time"
            {...register("endTime")}
            className="w-full rounded-xl border py-3 pl-10 pr-4"
          />
        </div>
      </div>
    </div>
  );
}
