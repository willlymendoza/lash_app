"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AppointmentDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteReason: string;
  onDeleteReasonChange: (reason: string) => void;
  deleteError: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AppointmentDeleteDialog({
  open,
  onOpenChange,
  deleteReason,
  onDeleteReasonChange,
  deleteError,
  onCancel,
  onConfirm,
}: AppointmentDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="deleteReason" className="text-sm font-medium">
              Deletion reason
            </label>
            <textarea
              id="deleteReason"
              value={deleteReason}
              onChange={(e) => onDeleteReasonChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Enter the reason for deleting this appointment..."
            />
          </div>

          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {deleteError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
