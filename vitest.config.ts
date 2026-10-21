import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import "./src/lib/env";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": fileURLToPath(
        new URL("./tests/setup/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    env: { APP_ENV: "test" },
    environment: "node",
    setupFiles: ["tests/setup/vitest.setup.ts"],
    globals: true,
    include: ["tests/integration/**/*.{test,spec}.{ts,tsx}"],
  },
});
