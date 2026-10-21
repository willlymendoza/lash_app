import { getRequiredEnv } from "@/lib/env";
import { db } from "@/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  baseURL: getRequiredEnv("BETTER_AUTH_URL"),
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
});

export type Session = typeof auth.$Infer.Session;
