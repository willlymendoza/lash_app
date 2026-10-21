"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditUserForm } from "@/modules/users/components/edit-user-form";

type EditUserFormProps = {
  userId: number;
  email: string;
  fullName: string;
  phone: string | null;
  isLashist: boolean;
  disabled?: boolean;
  canAssignLashist?: boolean;
};

export function EditUserDialog({
  userId,
  email,
  fullName,
  phone,
  isLashist: initialIsLashist,
  disabled = false,
  canAssignLashist = false,
}: EditUserFormProps) {
  const [open, setOpen] = useState(false);
  const [isLashist, setIsLashist] = useState(initialIsLashist);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    setIsLashist(initialIsLashist);
  }, [initialIsLashist]);

  const handleSwitchChange = (checked: boolean) => {
    if (!checked && isLashist) {
      // Attempting to uncheck: show confirmation dialog
      setShowConfirmDialog(true);
    } else {
      setIsLashist(checked);
    }
  };

  const handleConfirmUncheck = () => {
    setIsLashist(false);
    setShowConfirmDialog(false);
  };

  const handleCancelUncheck = () => {
    setShowConfirmDialog(false);
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer"
            disabled={disabled}
          >
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update the selected user's email, name, and phone number.
            </DialogDescription>
          </DialogHeader>

          <EditUserForm
            userId={userId}
            email={email}
            fullName={fullName}
            phone={phone}
            isLashist={isLashist}
            onIsLashistChange={handleSwitchChange}
            onSuccess={handleSuccess}
            canAssignLashist={canAssignLashist}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate lash artist?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this user as a lash artist? This may affect their assigned appointments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUncheck}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUncheck}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
