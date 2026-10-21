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
import { CreateUserForm } from "@/modules/users/components/create-user-form";

type CreateUserDialogProps = {
  canAssignLashist?: boolean;
};

export function CreateUserDialog({ canAssignLashist = false }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="cursor-pointer">
          Create user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Create a new user. An initial password will be generated.
          </DialogDescription>
        </DialogHeader>

        <CreateUserForm canAssignLashist={canAssignLashist} />
      </DialogContent>
    </Dialog>
  );
}
