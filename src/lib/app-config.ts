import { z } from "zod";

// Explicit property access lets Next.js include only these public values.
export const appConfig = z
  .object({
    name: z.string().min(1),
    locale: z
      .string()
      .min(1)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat(value);
          return true;
        } catch {
          return false;
        }
      }, "Invalid application locale."),
    timeZone: z.literal("America/Guatemala"),
    currencySymbol: z.string().min(1),
  })
  .parse({
    name: process.env.NEXT_PUBLIC_APP_NAME,
    locale: process.env.NEXT_PUBLIC_LOCALE,
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE,
    currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL,
  });
