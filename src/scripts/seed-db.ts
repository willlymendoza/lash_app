import { getAppEnv } from "../lib/env";

import { client } from "../db";
import { seedPermissions } from "./seed-permissions";
import { seedSystemRoles } from "./seed-admin-role";
import { bootstrapSuperadmin } from "./bootstrap-superadmin";
import { seedExpenseCategories } from "./seed-expense-categories";
import { seedPaymentMethods } from "./seed-payment-methods";

async function seedAll() {
  try {
    if (getAppEnv() === "test") {
      throw new Error(
        "The development seed cannot run against the test database. Integration tests manage their own test data.",
      );
    }

    console.log("[Seed] Starting full seed...");
    
    await seedPermissions();
    await seedSystemRoles();
    await bootstrapSuperadmin();
    await seedExpenseCategories();
    await seedPaymentMethods();
    
    console.log("[Seed] Seed completed successfully.");
  } catch (error) {
    console.error("[Seed] Error during seed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

void seedAll().catch((error) => {
  console.error("Error running the full seed:", error);
  process.exit(1);
});
