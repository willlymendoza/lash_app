import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { assertSeparateDatabases, getDatabaseUrl } from "@/lib/env";
import * as schema from "./schema";

assertSeparateDatabases();

// Reuse the connection pool when Next.js reloads server modules in development.
const globalForDatabase = globalThis as unknown as {
  databaseClients: Record<string, ReturnType<typeof postgres>> | undefined;
};
const databaseUrl = getDatabaseUrl();
const clients = globalForDatabase.databaseClients ?? {};
export const client =
  clients[databaseUrl] ?? postgres(databaseUrl, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  clients[databaseUrl] = client;
  globalForDatabase.databaseClients = clients;
}

export const db = drizzle(client, { schema });
