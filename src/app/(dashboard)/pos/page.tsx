import type { Metadata } from "next";
import { requirePermission } from "@/modules/permissions/server/queries";

export const metadata: Metadata = {
  title: "POS",
};

export default async function PosPage() {
  await requirePermission("pos.checkout");

  return <div>POS</div>;
}
