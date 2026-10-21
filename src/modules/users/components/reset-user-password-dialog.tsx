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
import { ResetUserPasswordForm } from "@/modules/users/components/reset-user-password-form";

type ResetUserPasswordDialogProps = {
  userId: number;
  fullName: string;
  disabled?: boolean;
};

export function ResetUserPasswordDialog({
  userId,
  fullName,
  disabled = false,
}: ResetUserPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setKey((prev) => prev + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="cursor-pointer"
          disabled={disabled}
        >
          Reset password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Are you sure you want to generate a new password for{" "}
            <strong>{fullName}</strong>? This action will generate a new random password that you must share with the user.
          </DialogDescription>
        </DialogHeader>

        <ResetUserPasswordForm
          key={key}
          userId={userId}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
