"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditLashistForm } from "@/modules/lashists/components/edit-lashist-form";

type EditLashistDialogProps = {
  lashistId: number;
  lashistName: string;
  defaultCommissionType: string;
  defaultCommissionValue: number;
  color?: string | null;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditLashistDialog({
  lashistId,
  lashistName,
  defaultCommissionType,
  defaultCommissionValue,
  color,
  open,
  onOpenChange,
}: EditLashistDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">
            Edit lash artist profile
          </DialogTitle>
          <DialogDescription className="text-ink-500">
            Editing commission settings for {lashistName}
          </DialogDescription>
        </DialogHeader>
        <EditLashistForm
          lashistId={lashistId}
          defaultCommissionType={defaultCommissionType}
          defaultCommissionValue={defaultCommissionValue}
          color={color}
          onSuccess={() => onOpenChange?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
