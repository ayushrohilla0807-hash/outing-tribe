import { CalendarDays, Clock, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { CreateOutingForm } from "../schema";

function getLocalToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalCurrentTime(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function addHoursToTime(timeStr: string, hoursToAdd: number = 2): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return "";
  const totalMinutes = parts[0] * 60 + parts[1] + hoursToAdd * 60;
  const newHours = Math.floor((totalMinutes / 60) % 24);
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
}

export default function DateTimePicker() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOutingForm>();

  const startDate = watch("date");
  const startTime = watch("startTime");
  const endDate = watch("endDate");
  const endTime = watch("endTime");

  const today = getLocalToday();
  const currentTime = getLocalCurrentTime();

  // Guard against any past dates in form state on load
  useEffect(() => {
    if (startDate && startDate < today) {
      setValue("date", today, { shouldValidate: true });
    }
    if (endDate && endDate < (startDate || today)) {
      setValue("endDate", startDate || today, { shouldValidate: true });
    }
  }, [today, startDate, endDate, setValue]);

  // If start date is today, min start time is current time
  const minStartTime = startDate === today ? currentTime : undefined;

  // Minimum end date must be at least start date or today
  const minEndDate = startDate || today;

  // If end date is same as start date, min end time is start time
  const minEndTime = endDate && startDate && endDate === startDate ? startTime : undefined;

  // Auto-sync End Date & End Time when Start Date or Start Time changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    if (newStartDate < today) {
      setValue("date", today, { shouldValidate: true, shouldDirty: true });
      return;
    }
    setValue("date", newStartDate, { shouldValidate: true, shouldDirty: true });

    // If endDate is empty or earlier than newStartDate, align it with newStartDate
    if (!endDate || endDate < newStartDate) {
      setValue("endDate", newStartDate, { shouldValidate: true, shouldDirty: true });
    }

    // If newStartDate is today and startTime is earlier than now, adjust startTime
    if (newStartDate === today && startTime && startTime < currentTime) {
      setValue("startTime", currentTime, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    // If startDate is today and user picks a past time, clamp to currentTime
    if (startDate === today && newStartTime < currentTime) {
      setValue("startTime", currentTime, { shouldValidate: true, shouldDirty: true });
      return;
    }
    setValue("startTime", newStartTime, { shouldValidate: true, shouldDirty: true });

    // If endDate is not set, set it to startDate or today
    const effectiveEndDate = endDate || startDate || today;
    if (!endDate) {
      setValue("endDate", effectiveEndDate, { shouldValidate: true });
    }

    // If endDate equals startDate, ensure endTime is strictly after newStartTime
    const effectiveStartDate = startDate || today;
    if (effectiveEndDate === effectiveStartDate) {
      if (!endTime || endTime <= newStartTime) {
        const defaultEndTime = addHoursToTime(newStartTime, 2);
        if (defaultEndTime) {
          setValue("endTime", defaultEndTime, { shouldValidate: true, shouldDirty: true });
        }
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    const effectiveMin = startDate || today;
    if (newEndDate < effectiveMin) {
      setValue("endDate", effectiveMin, { shouldValidate: true, shouldDirty: true });
      return;
    }
    setValue("endDate", newEndDate, { shouldValidate: true, shouldDirty: true });

    // If same day as start, check if endTime needs adjustment
    if (newEndDate === (startDate || today)) {
      if (endTime && startTime && endTime <= startTime) {
        const defaultEndTime = addHoursToTime(startTime, 2);
        setValue("endTime", defaultEndTime, { shouldValidate: true, shouldDirty: true });
      }
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setValue("endTime", newEndTime, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-3 box-border overflow-hidden">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Date & Time <span className="text-primary">*</span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full min-w-0 max-w-full box-border">
        {/* ─── FROM (Start) ─── */}
        <div className="w-full min-w-0 max-w-full space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4 box-border overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              From (Start) *
            </span>
          </div>

          <div className="w-full min-w-0 space-y-3">
            {/* Start Date */}
            <div className="w-full min-w-0 space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Start Date</label>
              <div className="relative w-full min-w-0 max-w-full">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  min={today}
                  {...register("date")}
                  onChange={handleStartDateChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onFocus={(e) => e.currentTarget.showPicker?.()}
                  className="block w-full min-w-0 max-w-full rounded-xl border border-white/15 bg-surface/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary transition cursor-pointer [color-scheme:dark] box-border [-webkit-appearance:none]"
                  style={{ minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              {errors.date && (
                <div className="flex items-center gap-1 text-xs text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.date.message}</span>
                </div>
              )}
            </div>

            {/* Start Time */}
            <div className="w-full min-w-0 space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Start Time</label>
              <div className="relative w-full min-w-0 max-w-full">
                <Clock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="time"
                  min={minStartTime}
                  {...register("startTime")}
                  onChange={handleStartTimeChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onFocus={(e) => e.currentTarget.showPicker?.()}
                  className="block w-full min-w-0 max-w-full rounded-xl border border-white/15 bg-surface/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary transition cursor-pointer [color-scheme:dark] box-border [-webkit-appearance:none]"
                  style={{ minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              {errors.startTime && (
                <div className="flex items-center gap-1 text-xs text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.startTime.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── TO (End) ─── */}
        <div className="w-full min-w-0 max-w-full space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4 box-border overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              To (End) *
            </span>
          </div>

          <div className="w-full min-w-0 space-y-3">
            {/* End Date */}
            <div className="w-full min-w-0 space-y-1">
              <label className="text-xs text-muted-foreground font-medium">End Date</label>
              <div className="relative w-full min-w-0 max-w-full">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  min={minEndDate}
                  {...register("endDate")}
                  onChange={handleEndDateChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onFocus={(e) => e.currentTarget.showPicker?.()}
                  className="block w-full min-w-0 max-w-full rounded-xl border border-white/15 bg-surface/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary transition cursor-pointer [color-scheme:dark] box-border [-webkit-appearance:none]"
                  style={{ minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              {errors.endDate && (
                <div className="flex items-center gap-1 text-xs text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.endDate.message}</span>
                </div>
              )}
            </div>

            {/* End Time */}
            <div className="w-full min-w-0 space-y-1">
              <label className="text-xs text-muted-foreground font-medium">End Time</label>
              <div className="relative w-full min-w-0 max-w-full">
                <Clock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="time"
                  min={minEndTime}
                  {...register("endTime")}
                  onChange={handleEndTimeChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onFocus={(e) => e.currentTarget.showPicker?.()}
                  className="block w-full min-w-0 max-w-full rounded-xl border border-white/15 bg-surface/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary transition cursor-pointer [color-scheme:dark] box-border [-webkit-appearance:none]"
                  style={{ minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              {errors.endTime && (
                <div className="flex items-center gap-1 text-xs text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.endTime.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
