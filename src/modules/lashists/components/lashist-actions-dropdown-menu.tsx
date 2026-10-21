"use client";

import { useState } from "react";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditLashistDialog } from "@/modules/lashists/components/edit-lashist-dialog";
import { DeactivateLashistAlertDialog } from "@/modules/lashists/components/deactivate-lashist-alert-dialog";
import { ActivateLashistAlertDialog } from "@/modules/lashists/components/activate-lashist-alert-dialog";

type LashistActionsDropdownMenuProps = {
  lashistId: number;
  lashistName: string;
  defaultCommissionType: string;
  defaultCommissionValue: number;
  color?: string | null;
  isDeleted: boolean;
  canUpdate: boolean;
  canAssignLashist: boolean;
};

export function LashistActionsDropdownMenu({
  lashistId,
  lashistName,
  defaultCommissionType,
  defaultCommissionValue,
  color,
  isDeleted,
  canUpdate,
  canAssignLashist,
}: LashistActionsDropdownMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-ink-200 text-ink-700 hover:bg-surface-100 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canUpdate && !isDeleted && (
            <DropdownMenuItem
              onClick={() => setIsEditDialogOpen(true)}
              className="cursor-pointer"
            >
              Edit
            </DropdownMenuItem>
          )}
          {canAssignLashist && !isDeleted && (
            <DropdownMenuItem
              onClick={() => setIsDeactivateDialogOpen(true)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              Deactivate
            </DropdownMenuItem>
          )}
          {canAssignLashist && isDeleted && (
            <DropdownMenuItem
              onClick={() => setIsActivateDialogOpen(true)}
              className="cursor-pointer text-emerald-600 focus:text-emerald-600"
            >
              Activate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canUpdate && (
        <EditLashistDialog
          lashistId={lashistId}
          lashistName={lashistName}
          defaultCommissionType={defaultCommissionType}
          defaultCommissionValue={defaultCommissionValue}
          color={color}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      {canAssignLashist && (
        <DeactivateLashistAlertDialog
          lashistId={lashistId}
          lashistName={lashistName}
          open={isDeactivateDialogOpen}
          onOpenChange={setIsDeactivateDialogOpen}
        />
      )}

      {canAssignLashist && (
        <ActivateLashistAlertDialog
          lashistId={lashistId}
          lashistName={lashistName}
          open={isActivateDialogOpen}
          onOpenChange={setIsActivateDialogOpen}
        />
      )}
    </>
  );
}
