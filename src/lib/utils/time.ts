/**
 * Format a duration in minutes for display.
 * Show minutes for durations shorter than an hour.
 * Show hours and minutes for longer durations.
 * @param minutes - The duration in minutes
 * @returns The formatted duration string (e.g. "30 min", "1h 30min", "2h")
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) {
    return "-";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Convert a 24-hour time to 12-hour time with AM/PM.
 * @param time - Time in 24-hour HH:MM format
 * @returns The formatted time string (e.g. "09:30 AM", "1:05 PM")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
