import type { Metadata } from "next";
import { requirePermission } from "@/modules/permissions/server/queries";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  await requirePermission("reports.view");

  return <div>Reports</div>;
}
