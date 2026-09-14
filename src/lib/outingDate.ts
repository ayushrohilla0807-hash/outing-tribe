/**
 * Shared helper to safely parse an outing's end date & time across all platforms,
 * Safari/WebKit, Android, iOS, and different user timezones.
 */

export interface OutingTimeFields {
  status?: string | null;
  outing_date?: string | null;
  outingDate?: string | null;
  date?: string | null;
  start_time?: string | null;
  startTime?: string | null;
  end_time?: string | null;
  endTime?: string | null;
}

/**
 * Safely parses an outing's end date & time into a JavaScript Date object in local time.
 * Returns null if parsing fails completely or fields are invalid.
 */
export function getOutingEndDateTime(outing: OutingTimeFields): Date | null {
  const dateStr = outing.outing_date || outing.outingDate || outing.date;
  if (!dateStr || typeof dateStr !== "string") return null;

  const rawEndTime = outing.end_time || outing.endTime;
  const rawStartTime = outing.start_time || outing.startTime;

  // 1. Parse date components (handles YYYY-MM-DD, YYYY/MM/DD, ISO strings)
  let year: number | null = null;
  let month: number | null = null; // 0-indexed for Date constructor
  let day: number | null = null;

  const isoMatch = dateStr.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  } else {
    // Try native date parsing
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      year = parsed.getFullYear();
      month = parsed.getMonth();
      day = parsed.getDate();
    }
  }

  if (
    year === null ||
    month === null ||
    day === null ||
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day)
  ) {
    return null;
  }

  // 2. Helper to parse time string into 24-hour { hours, minutes }
  const parseTimeString = (
    timeStr?: string | null,
  ): { hours: number; minutes: number } | null => {
    if (!timeStr || typeof timeStr !== "string") return null;
    const trimmed = timeStr.trim();
    if (!trimmed) return null;

    // 12-hour format: e.g. "07:30 PM", "7:30pm", "11:00 AM"
    const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([aApP][mM])$/i);
    if (match12) {
      let h = parseInt(match12[1], 10);
      const m = parseInt(match12[2], 10);
      const meridiem = match12[3].toUpperCase();
      if (meridiem === "PM" && h < 12) h += 12;
      if (meridiem === "AM" && h === 12) h = 0;
      return { hours: h, minutes: m };
    }

    // 24-hour format: e.g. "19:30", "19:30:00", "07:30"
    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (match24) {
      const h = parseInt(match24[1], 10);
      const m = parseInt(match24[2], 10);
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        return { hours: h, minutes: m };
      }
    }

    return null;
  };

  const parsedEndTime = parseTimeString(rawEndTime);
  const parsedStartTime = parseTimeString(rawStartTime);

  if (parsedEndTime) {
    let targetYear = year;
    let targetMonth = month;
    let targetDay = day;

    // Overnight outing handling: if end_time is earlier than start_time (e.g. 10 PM to 2 AM), end date is next day
    if (parsedStartTime) {
      const startMinutes = parsedStartTime.hours * 60 + parsedStartTime.minutes;
      const endMinutes = parsedEndTime.hours * 60 + parsedEndTime.minutes;
      if (endMinutes < startMinutes) {
        const nextDay = new Date(year, month, day + 1);
        targetYear = nextDay.getFullYear();
        targetMonth = nextDay.getMonth();
        targetDay = nextDay.getDate();
      }
    }

    const endDate = new Date(
      targetYear,
      targetMonth,
      targetDay,
      parsedEndTime.hours,
      parsedEndTime.minutes,
      0,
      0,
    );
    return isNaN(endDate.getTime()) ? null : endDate;
  }

  if (parsedStartTime) {
    // If no end time specified, default to start time + 3 hours
    const startDate = new Date(
      year,
      month,
      day,
      parsedStartTime.hours,
      parsedStartTime.minutes,
      0,
      0,
    );
    if (isNaN(startDate.getTime())) return null;
    return new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
  }

  // Fallback: End of the outing day (23:59:59.999)
  const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
  return isNaN(endOfDay.getTime()) ? null : endOfDay;
}

/**
 * Checks whether an outing is active (has NOT ended yet).
 * Returns true if:
 * - status is not 'cancelled' or 'completed'
 * - end datetime is strictly in the future (end_datetime > referenceNow)
 */
export function isOutingActive(
  outing: OutingTimeFields,
  referenceNow: Date = new Date(),
): boolean {
  if (outing.status === "cancelled" || outing.status === "completed") {
    return false;
  }

  const endDateTime = getOutingEndDateTime(outing);
  if (!endDateTime) {
    // Fail safely: if date is unparseable or corrupted, exclude it
    return false;
  }

  return endDateTime.getTime() > referenceNow.getTime();
}

/**
 * Checks whether an outing has ended (end_datetime <= referenceNow).
 */
export function isOutingEnded(
  outing: OutingTimeFields,
  referenceNow: Date = new Date(),
): boolean {
  return !isOutingActive(outing, referenceNow);
}
