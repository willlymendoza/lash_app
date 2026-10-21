import type { Metadata } from "next";

import { requirePermission } from "@/modules/permissions/server/queries";
import { UsersManagement } from "@/modules/users/components/users-management";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  await requirePermission("users.read");

  return (
    <div className="space-y-4">
      <UsersManagement />
    </div>
  );
}
