import type { Metadata } from "next";

import { hasPermissions, requirePermission } from "@/modules/permissions/server/queries";
import { getLashists } from "@/modules/lashists/server/queries";
import { LashistsManagement } from "@/modules/lashists/components/lashists-management";

export const metadata: Metadata = {
  title: "Lash Artists",
};

export default async function LashistsPage() {
  await requirePermission("lashists.read");

  const permissions = await hasPermissions([
    "lashists.read",
    "lashists.update",
    "users.assign-lashist",
  ]);

  const lashists = await getLashists(true);

  return <LashistsManagement lashists={lashists} permissions={permissions} />;
}
