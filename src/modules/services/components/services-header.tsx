"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreateServiceDialog } from "@/modules/services/components/create-service-dialog";

type ServicesHeaderProps = {
  showDeleted: boolean;
  showInactive: boolean;
  onShowDeletedChange: (value: boolean) => void;
  onShowInactiveChange: (value: boolean) => void;
  canCreate: boolean;
  isCreateDialogOpen: boolean;
  onCreateDialogOpenChange: (open: boolean) => void;
};

export function ServicesHeader({
  showDeleted,
  showInactive,
  onShowDeletedChange,
  onShowInactiveChange,
  canCreate,
  isCreateDialogOpen,
  onCreateDialogOpenChange,
}: ServicesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-ink-900">Services</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="show-deleted"
            checked={showDeleted}
            onCheckedChange={onShowDeletedChange}
            className="cursor-pointer"
          />
          <Label htmlFor="show-deleted" className="cursor-pointer">
            Deleted
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={onShowInactiveChange}
            className="cursor-pointer"
          />
          <Label htmlFor="show-inactive" className="cursor-pointer">
            Inactive
          </Label>
        </div>
        {canCreate && (
          <CreateServiceDialog
            open={isCreateDialogOpen}
            onOpenChange={onCreateDialogOpenChange}
          />
        )}
      </div>
    </div>
  );
}
