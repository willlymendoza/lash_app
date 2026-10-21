"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AppointmentStatusActionDialogProps = {
  open: boolean;
  pendingStatusAction: "cancelled" | "no_show" | null;
  statusNote: string;
  statusError: string;
  isStatusPending: boolean;
  onStatusNoteChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AppointmentStatusActionDialog({
  open,
  pendingStatusAction,
  statusNote,
  statusError,
  isStatusPending,
  onStatusNoteChange,
  onOpenChange,
  onCancel,
  onConfirm,
}: AppointmentStatusActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pendingStatusAction === "cancelled"
              ? "Confirm cancellation"
              : "Confirm no-show"}
          </DialogTitle>
          <DialogDescription>
            {pendingStatusAction === "cancelled"
              ? "This will mark the appointment as cancelled and free its calendar slot."
              : "This will mark the appointment as a no-show and free its calendar slot."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="statusNote">
            Status change note <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="statusNote"
            placeholder="Describe the reason for the status change..."
            rows={4}
            value={statusNote}
            onChange={(event) => onStatusNoteChange(event.target.value)}
            disabled={isStatusPending}
          />
          {statusError && <p className="text-sm text-red-500">{statusError}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isStatusPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={pendingStatusAction === "cancelled" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isStatusPending}
          >
            {isStatusPending ? "Saving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
