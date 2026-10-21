import type { Metadata } from "next";
import { requirePermission } from "@/modules/permissions/server/queries";

export const metadata: Metadata = {
  title: "Sales",
};

export default async function SalesPage() {
  await requirePermission("sales.read");

  return <div>Sales</div>;
}
