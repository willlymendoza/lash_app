import type { Metadata } from "next";
import { requirePermission } from "@/modules/permissions/server/queries";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  await requirePermission("products.read");

  return <div>Products</div>;
}
