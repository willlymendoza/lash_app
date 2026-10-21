import "../lib/env";

import { db } from "../db";
import { permissions } from "../db/schema";
import { permissionCatalog } from "@/scripts/permission-catalog";

export async function seedPermissions() {
  for (const permission of permissionCatalog) {
    await db
      .insert(permissions)
      .values({
        key: permission.key,
        module: permission.module,
        name: permission.name,
        description: permission.description,
      })
      .onConflictDoUpdate({
        target: permissions.key,
        set: {
          module: permission.module,
          name: permission.name,
          description: permission.description,
          deletedAt: null,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`Permissions synchronized: ${permissionCatalog.length}`);
}
