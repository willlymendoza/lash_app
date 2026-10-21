import { sql } from "drizzle-orm";

import { client, db } from "../db";
import { getAppEnv, getDatabaseConfig } from "../lib/env";

async function checkDatabase() {
  const environment = getAppEnv();
  const database = getDatabaseConfig(environment);

  try {
    // Resolve every table and column from the reported failing query, without changing data.
    await db.execute(sql`
      SELECT p.key
      FROM user_roles AS ur
      INNER JOIN roles AS r ON r.id = ur.role_id
      INNER JOIN role_permissions AS rp ON rp.role_id = r.id
      INNER JOIN permissions AS p ON p.id = rp.permission_id
      WHERE ur.user_id = -1
        AND ur.deleted_at IS NULL
        AND r.deleted_at IS NULL
        AND r.is_active = true
        AND rp.deleted_at IS NULL
        AND p.deleted_at IS NULL
      LIMIT 0
    `);
    console.log(
      `[Database] ${environment}: ${database.database} on ${database.host}:${database.port}; permission schema is ready.`,
    );
  } catch (error) {
    const cause = error instanceof Error && error.cause ? error.cause : error;
    const failure = cause as { code?: string; message?: string };
    console.error(
      `[Database] ${environment}: permission schema check failed (${failure.code ?? "unknown"}).`,
      failure.message ?? "Unable to connect or read the permission tables.",
    );
    console.error(
      "For a fresh database, run pnpm db:generate, pnpm db:migrate, and pnpm db:seed in that order.",
    );
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void checkDatabase();
