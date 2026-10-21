import { defineConfig } from "drizzle-kit";

import { assertSeparateDatabases, getDatabaseUrl } from "./src/lib/env";

assertSeparateDatabases();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: { url: getDatabaseUrl() },
  verbose: true,
  strict: true,
});
