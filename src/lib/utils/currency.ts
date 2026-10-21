import { appConfig } from "@/lib/app-config";

/**
 * Format a numeric value using the configured currency symbol.
 * @param value - The numeric value or string to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns The formatted price string
 */
export function formatPrice(
  value: number | string,
  decimals: number = 2
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return `${appConfig.currencySymbol} ${(0).toFixed(decimals)}`;
  }
  return `${appConfig.currencySymbol} ${numValue.toFixed(decimals)}`;
}
