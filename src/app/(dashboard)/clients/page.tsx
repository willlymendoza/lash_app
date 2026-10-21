import type { Metadata } from "next";

import { hasPermissions, requirePermission } from "@/modules/permissions/server/queries";
import { getClients } from "@/modules/clients/server/queries/get-clients";
import { ClientsManagement } from "@/modules/clients/components/clients-management";

export const metadata: Metadata = {
  title: "Clients",
};

export default async function ClientsPage() {
  await requirePermission("clients.read");

  const permissions = await hasPermissions([
    "clients.read",
    "clients.create",
    "clients.update",
    "clients.add-note",
    "clients.remove",
    "clients.restore",
  ]);

  const clients = await getClients(true);

  return (
    <ClientsManagement
      clients={clients}
      canCreate={permissions["clients.create"]}
      canUpdate={permissions["clients.update"]}
      canAddNote={permissions["clients.add-note"]}
      canRemove={permissions["clients.remove"]}
      canRestore={permissions["clients.restore"]}
    />
  );
}
