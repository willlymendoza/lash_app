import type { Metadata } from "next";

import {
  hasPermissions,
  requirePermission,
} from "@/modules/permissions/server/queries";
import { getServices } from "@/modules/services/server/queries/get-services";
import { ServicesManagement } from "@/modules/services/components/services-management";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  await requirePermission("services.read");

  const permissions = await hasPermissions([
    "services.read",
    "services.create",
    "services.update",
    "services.remove",
    "services.restore",
    "services.toggle-active",
  ]);

  const services = await getServices(true, true);

  return <ServicesManagement services={services} permissions={permissions} />;
}
