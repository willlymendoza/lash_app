"use client";

import { useState } from "react";
import { useActionState } from "react";
import { RefreshCw } from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteClientAlertDialog } from "@/modules/clients/components/delete-client-alert-dialog";
import { restoreClientFromForm } from "@/modules/clients/server/actions/restore-client";
import { EditClientDialog } from "@/modules/clients/components/edit-client-dialog";
import { formatDate } from "@/lib/utils/date";

type ClientProfileCardProps = {
  client: {
    id: number;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    instagram: string | null;
    email: string | null;
    birthDate: Date | null;
    deletedAt: Date | null;
  };
  canUpdate: boolean;
  canRemove: boolean;
  canRestore: boolean;
};

export function ClientProfileCard({
  client,
  canUpdate,
  canRemove,
  canRestore,
}: ClientProfileCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [state, action, isPending] = useActionState(restoreClientFromForm, {
    status: "idle",
    message: null,
  });

  const isDeleted = client.deletedAt !== null;
  const fullName = [client.firstName, client.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className="bg-surface-0 border-ink-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-ink-900">Client Details</CardTitle>
          <div className="flex items-center gap-2">
            {canUpdate && !isDeleted && (
              <EditClientDialog
                client={client}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100"
                >
                  Edit
                </Button>
              </EditClientDialog>
            )}
            {canRemove && !isDeleted && (
              <DeleteClientAlertDialog
                clientId={client.id}
                clientName={fullName}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </DeleteClientAlertDialog>
            )}
            {canRestore && isDeleted && (
              <form action={action}>
                <input type="hidden" name="id" value={client.id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isPending ? "Restoring..." : "Restore"}
                </button>
              </form>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="text-sm text-ink-500">Full name</p>
          <p className="text-ink-900 font-medium">{fullName}</p>
        </div>
        {client.phone && (
          <div>
            <p className="text-sm text-ink-500">Phone</p>
            <p className="text-ink-900">{client.phone}</p>
          </div>
        )}
        {client.email && (
          <div>
            <p className="text-sm text-ink-500">Email</p>
            <p className="text-ink-900">{client.email}</p>
          </div>
        )}
        {client.birthDate && (
          <div>
            <p className="text-sm text-ink-500">Date of birth</p>
            <p className="text-ink-900">{formatDate(client.birthDate, "long")}</p>
          </div>
        )}
        {client.address && (
          <div>
            <p className="text-sm text-ink-500">Address</p>
            <p className="text-ink-900">{client.address}</p>
          </div>
        )}
        {client.instagram && (
          <div>
            <p className="text-sm text-ink-500">Instagram</p>
            <p className="text-ink-900">@{client.instagram}</p>
          </div>
        )}
        {isDeleted && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-600">
              This client has been deleted.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
