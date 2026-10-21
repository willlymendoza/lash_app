"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddClientNoteDialog } from "@/modules/clients/components/add-client-note-dialog";
import { ClientActionsDropdown } from "@/modules/clients/components/client-actions-dropdown";
import { EditClientDialog } from "@/modules/clients/components/edit-client-dialog";
import { MoreVertical, Edit, Plus } from "lucide-react";

type ClientActionsDropdownMenuProps = {
  clientId: number;
  clientName: string;
  client: {
    id: number;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    instagram: string | null;
    email: string | null;
  };
  isDeleted: boolean;
  canUpdate: boolean;
  canAddNote: boolean;
  canRemove: boolean;
  canRestore: boolean;
};

export function ClientActionsDropdownMenu({
  clientId,
  clientName,
  client,
  isDeleted,
  canUpdate,
  canAddNote,
  canRemove,
  canRestore,
}: ClientActionsDropdownMenuProps) {
  const [activeDialog, setActiveDialog] = useState<"edit" | "note" | null>(
    null,
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer hover:bg-surface-100"
          >
            <MoreVertical className="h-4 w-4 text-ink-700" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-surface-0 border-ink-200"
        >
          {canUpdate && !isDeleted && (
            <DropdownMenuItem
              className="cursor-pointer text-ink-700 hover:bg-surface-100"
              onSelect={() => {
                setActiveDialog("edit");
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {canAddNote && !isDeleted && (
            <DropdownMenuItem
              className="cursor-pointer text-ink-700 hover:bg-surface-100"
              onSelect={() => {
                setActiveDialog("note");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add note
            </DropdownMenuItem>
          )}
          {(canUpdate || canAddNote) && !isDeleted && (
            <DropdownMenuSeparator className="bg-ink-200" />
          )}
          {canRemove && !isDeleted && (
            <ClientActionsDropdown
              clientId={clientId}
              clientName={clientName}
              isDeleted={isDeleted}
            />
          )}
          {canRestore && isDeleted && (
            <ClientActionsDropdown
              clientId={clientId}
              clientName={clientName}
              isDeleted={isDeleted}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditClientDialog
        client={client}
        open={activeDialog === "edit"}
        onOpenChange={(open) => setActiveDialog(open ? "edit" : null)}
      />

      <AddClientNoteDialog
        clientId={clientId}
        open={activeDialog === "note"}
        onOpenChange={(open) => setActiveDialog(open ? "note" : null)}
      />
    </>
  );
}
