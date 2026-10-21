import { randomInt } from "node:crypto";
import { z } from "zod";

import { getRequiredEnv } from "./env";

export function generateInitialPassword(): string {
  const charset = z
    .string()
    .min(2)
    .parse(getRequiredEnv("INITIAL_PASSWORD_CHARSET"));
  const length = z.coerce
    .number()
    .int()
    .min(8)
    .max(128)
    .parse(getRequiredEnv("INITIAL_PASSWORD_LENGTH"));

  return Array.from({ length }, () => charset[randomInt(charset.length)]).join("");
}
