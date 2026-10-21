import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

config({ path: resolve(process.cwd(), ".env"), quiet: true });

export type AppEnv = "development" | "test";

export function getAppEnv(): AppEnv {
  return z.enum(["development", "test"]).parse(
    process.env.APP_ENV ||
      (process.env.NODE_ENV === "test" ? "test" : "development"),
  );
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

process.env.TZ = getRequiredEnv("NEXT_PUBLIC_TIMEZONE");

const databaseSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});

export function getDatabaseConfig(environment: AppEnv = getAppEnv()) {
  const prefix = environment === "test" ? "POSTGRES_TEST" : "POSTGRES_DEV";
  return databaseSchema.parse({
    host: getRequiredEnv("POSTGRES_HOST"),
    port: getRequiredEnv(`${prefix}_PORT`),
    database: getRequiredEnv(`${prefix}_DB`),
    username: getRequiredEnv("POSTGRES_USER"),
    password: getRequiredEnv("POSTGRES_PASSWORD"),
  });
}

export function getDatabaseUrl(environment: AppEnv = getAppEnv()): string {
  const database = getDatabaseConfig(environment);
  return `postgresql://${encodeURIComponent(database.username)}:${encodeURIComponent(database.password)}@${database.host}:${database.port}/${encodeURIComponent(database.database)}`;
}

export function assertSeparateDatabases() {
  const development = getDatabaseConfig("development");
  const test = getDatabaseConfig("test");
  if (
    development.host === test.host &&
    development.port === test.port &&
    development.database === test.database
  ) {
    throw new Error("Development and test must use separate databases.");
  }
}
