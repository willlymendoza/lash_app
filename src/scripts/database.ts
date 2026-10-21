import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { z } from "zod";

import { assertSeparateDatabases, type AppEnv } from "../lib/env";

const command = z
  .enum(["generate", "migrate", "push", "seed", "studio", "check"])
  .parse(process.argv[2]);
const requestedEnvironment = process.argv[3];

if (command === "seed" && requestedEnvironment === "test") {
  throw new Error(
    "db:seed only supports development. Integration tests manage their own test data.",
  );
}

const environments: AppEnv[] = requestedEnvironment
  ? [z.enum(["development", "test"]).parse(requestedEnvironment)]
  : command === "generate" || command === "studio" || command === "seed"
    ? ["development"]
    : ["development", "test"];

assertSeparateDatabases();

for (const environment of environments) {
  console.log(`[Database] ${command}: ${environment}`);
  const args =
    command === "seed" || command === "check"
      ? [
          resolve("node_modules/tsx/dist/cli.mjs"),
          command === "seed"
            ? "src/scripts/seed-db.ts"
            : "src/scripts/check-database.ts",
        ]
      : [resolve("node_modules/drizzle-kit/bin.cjs"), command];
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      APP_ENV: environment,
      NODE_ENV: environment === "test" ? "test" : "development",
    },
  });
  if (result.error || result.status !== 0) {
    console.error(
      `[Database] ${command} failed for ${environment}. Fix the error before continuing.`,
    );
    process.exit(result.status ?? 1);
  }
}
