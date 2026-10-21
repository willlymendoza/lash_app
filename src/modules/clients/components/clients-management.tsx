"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateClientForm } from "@/modules/clients/components/create-client-form";
import { ClientsTable } from "@/modules/clients/components/clients-table";
import { usePathname } from "next/navigation";

type ClientsManagementProps = {
  clients: Array<{
    id: number;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    instagram: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  canCreate: boolean;
  canUpdate: boolean;
  canAddNote: boolean;
  canRemove: boolean;
  canRestore: boolean;
};

export function ClientsManagement({
  clients,
  canCreate,
  canUpdate,
  canAddNote,
  canRemove,
  canRestore,
}: ClientsManagementProps) {
  const pathname = usePathname();
  const [showDeleted, setShowDeleted] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredClients = showDeleted
    ? clients
    : clients.filter((client) => client.deletedAt === null);

  return (
    <div className="flex flex-col gap-4" key={pathname}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Clients</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100"
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? "Hide deleted" : "View deleted"}
          </Button>
          {canCreate && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white">
                  Create client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-surface-0 border-ink-200">
                <DialogHeader>
                  <DialogTitle className="text-ink-900">
                    Create new client
                  </DialogTitle>
                  <DialogDescription className="text-ink-500">
                    Complete the form to register a new client.
                  </DialogDescription>
                </DialogHeader>
                <CreateClientForm
                  onSuccess={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <ClientsTable
        clients={filteredClients}
        showDeleted={showDeleted}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canAddNote={canAddNote}
        canRemove={canRemove}
        canRestore={canRestore}
      />
    </div>
  );
}
