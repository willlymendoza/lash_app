import { appConfig } from "@/lib/app-config";

export function formatDateTime(
  value: Date | string | number,
  locale = appConfig.locale,
) {
  const normalizedValue =
    typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(new Date(normalizedValue).getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(locale, {
    timeZone: appConfig.timeZone,
    dateStyle: "short",
    timeStyle: "short",
  }).format(normalizedValue);
}

