"use client";

import { useState } from "react";

import { DeleteServiceDialog } from "@/modules/services/components/delete-service-dialog";
import { RestoreServiceDialog } from "@/modules/services/components/restore-service-dialog";
import { ServiceActionsMenu } from "@/modules/services/components/service-actions-menu";

type ServiceActionsDropdownProps = {
  serviceId: number;
  serviceName: string;
  isDeleted: boolean;
  isActive: boolean;
  canUpdate: boolean;
  canRemove: boolean;
  canRestore: boolean;
  canToggleActive: boolean;
  onEdit?: () => void;
};

export function ServiceActionsDropdown({
  serviceId,
  serviceName,
  isDeleted,
  isActive,
  canUpdate,
  canRemove,
  canRestore,
  canToggleActive,
  onEdit,
}: ServiceActionsDropdownProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  if (isDeleted) {
    return (
      <>
        {canRestore && (
          <>
            <button
              type="button"
              onClick={() => {
                setIsRestoreDialogOpen(true);
              }}
              className="flex items-center gap-2 w-full px-2 py-2 text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer"
            >
              Restore
            </button>
            <RestoreServiceDialog
              open={isRestoreDialogOpen}
              onOpenChange={setIsRestoreDialogOpen}
              serviceId={serviceId}
              serviceName={serviceName}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <ServiceActionsMenu
        serviceId={serviceId}
        isActive={isActive}
        canUpdate={canUpdate}
        canRemove={canRemove}
        canToggleActive={canToggleActive}
        onEdit={onEdit}
        onDeleteClick={() => setIsDeleteDialogOpen(true)}
      />

      <DeleteServiceDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        serviceId={serviceId}
        serviceName={serviceName}
      />
    </>
  );
}
