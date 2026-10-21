import type { Metadata } from "next";
import { requirePermission } from "@/modules/permissions/server/queries";

export const metadata: Metadata = {
  title: "Supplies",
};

export default async function SuppliesPage() {
  await requirePermission("supplies.read");

  return <div>Supplies</div>;
}
