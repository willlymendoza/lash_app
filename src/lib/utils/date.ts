import { appConfig } from "@/lib/app-config";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import type { DateRange } from "react-day-picker";

export type DateFilterPreset = "today" | "week" | "month" | "custom" | "all";

/**
 * Format a date in Guatemala time
 * @param date - The date to format
 * @param format - The requested format (default: "short")
 * @returns The formatted date string
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" | "numeric" = "short",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: appConfig.timeZone,
  };

  switch (format) {
    case "short":
      options.day = "2-digit";
      options.month = "2-digit";
      options.year = "numeric";
      break;
    case "long":
      options.day = "2-digit";
      options.month = "long";
      options.year = "numeric";
      break;
    case "numeric":
      options.year = "numeric";
      break;
  }

  return dateObj.toLocaleDateString(appConfig.locale, options);
}

/**
 * Format a date-only value without timezone conversion.
 * @param isoDate - Date in YYYY-MM-DD format
 * @returns Date in DD/MM/YYYY format
 */
export function formatISODateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");

  if (!year || !month || !day) {
    return isoDate;
  }

  return `${day}/${month}/${year}`;
}

/**
 * Normalize a flexible date to YYYY-MM-DD in Guatemala time.
 */
export function normalizeToGuatemalaISODateOnly(
  value: Date | string | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return toGuatemalaISODate(value);
  }

  if (value.includes("T")) {
    return toGuatemalaISODate(new Date(value));
  }

  return value.slice(0, 10);
}

/**
 * Format a flexible date as DD/MM/YYYY in Guatemala time.
 */
export function formatFlexibleDateToGuatemalaDisplay(
  value: Date | string | null | undefined,
): string {
  const isoDateOnly = normalizeToGuatemalaISODateOnly(value);

  if (!isoDateOnly) {
    return "Not applicable";
  }

  return formatISODateOnly(isoDateOnly);
}

/**
 * Parse YYYY-MM-DD as a local date without shifting the calendar day.
 */
export function parseISODateOnlyAsLocalDate(
  isoDate: string | null | undefined,
): Date | undefined {
  if (!isoDate) {
    return undefined;
  }

  const [yearRaw, monthRaw, dayRaw] = isoDate.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    !yearRaw ||
    !monthRaw ||
    !dayRaw
  ) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

/**
 * Format a Date as YYYY-MM-DD using its local calendar fields.
 */
export function formatLocalDateAsISODateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Format a date as YYYY-MM-DD in Guatemala time.
 */
export function toGuatemalaISODate(date: Date): string {
  return formatInTimeZone(date, appConfig.timeZone, "yyyy-MM-dd");
}

/**
 * Get a preset date range in Guatemala time.
 */
export function getGuatemalaPresetDateRange(
  preset: Exclude<DateFilterPreset, "custom" | "all">,
): { startDate: string; endDate: string } {
  const nowInGuatemala = toZonedTime(new Date(), appConfig.timeZone);

  if (preset === "today") {
    const today = formatLocalDateAsISODateOnly(nowInGuatemala);
    return { startDate: today, endDate: today };
  }

  if (preset === "week") {
    const weekStart = startOfWeek(nowInGuatemala, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(nowInGuatemala, { weekStartsOn: 1 });

    return {
      startDate: formatLocalDateAsISODateOnly(weekStart),
      endDate: formatLocalDateAsISODateOnly(weekEnd),
    };
  }

  const monthStart = startOfMonth(nowInGuatemala);
  const monthEnd = endOfMonth(nowInGuatemala);

  return {
    startDate: formatLocalDateAsISODateOnly(monthStart),
    endDate: formatLocalDateAsISODateOnly(monthEnd),
  };
}

/**
 * Resolve a custom date range, including partial selections:
 * - from only => one day
 * - to only => one day
 * - from + to => inclusive range
 */
export function resolveCustomDateRange(
  customDateRange: DateRange | undefined,
): { startDate: string; endDate: string } | null {
  const fromDate = customDateRange?.from
    ? toGuatemalaISODate(customDateRange.from)
    : null;
  const toDate = customDateRange?.to ? toGuatemalaISODate(customDateRange.to) : null;

  if (!fromDate && !toDate) {
    return null;
  }

  if (fromDate && !toDate) {
    return { startDate: fromDate, endDate: fromDate };
  }

  if (!fromDate && toDate) {
    return { startDate: toDate, endDate: toDate };
  }

  if (!fromDate || !toDate) {
    return null;
  }

  return fromDate <= toDate
    ? { startDate: fromDate, endDate: toDate }
    : { startDate: toDate, endDate: fromDate };
}
