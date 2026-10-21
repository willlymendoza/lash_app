// @vitest-environment node

import { afterAll, describe, expect, it } from "vitest";

import { client } from "@/db";
import { getAppEnv } from "@/lib/env";
import { getEffectivePermissionSetForUser } from "@/modules/permissions/server/queries/get-effective-permission-set-for-user";

afterAll(async () => {
  await client.end();
});

describe("permission schema integration", () => {
  it("runs the permission join against the migrated test schema", async () => {
    expect(getAppEnv()).toBe("test");
    // Serial IDs are positive. This exercises the real join without needing seed data.
    const permissions = await getEffectivePermissionSetForUser(-1);
    expect(permissions.size).toBe(0);
  });
});
