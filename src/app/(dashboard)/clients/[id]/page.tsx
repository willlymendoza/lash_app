import {
  hasPermissions,
  requirePermission,
} from "@/modules/permissions/server/queries";
import { getClientProfile } from "@/modules/clients/server/queries";
import { ClientProfile } from "@/modules/clients/components/client-profile";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientProfilePage({ params }: PageProps) {
  await requirePermission("clients.read");

  const { id } = await params;
  const clientId = Number(id);

  if (isNaN(clientId)) {
    notFound();
  }

  const permissions = await hasPermissions([
    "clients.read",
    "clients.update",
    "clients.remove",
    "clients.restore",
    "clients.add-note",
    "clients.edit-note",
    "clients.delete-note",
    "clients.restore-note",
  ]);

  const profile = await getClientProfile({
    clientId,
    includeDeletedClient: true,
    includeDeletedNotes: true,
  });

  if (!profile) {
    notFound();
  }

  return (
    <ClientProfile
      client={profile.client}
      notes={profile.notes}
      permissions={permissions}
    />
  );
}
