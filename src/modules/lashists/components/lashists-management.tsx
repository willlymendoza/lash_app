"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LashistsTable } from "@/modules/lashists/components/lashists-table";

type LashistsManagementProps = {
  lashists: Array<{
    id: number;
    userId: number;
    fullName: string;
    email: string;
    phone: string | null;
    defaultCommissionType: string;
    defaultCommissionValue: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  permissions: Record<string, boolean>;
};

export function LashistsManagement({
  lashists,
  permissions,
}: LashistsManagementProps) {
  const [showDeleted, setShowDeleted] = useState(false);

  const filteredLashists = showDeleted
    ? lashists
    : lashists.filter((lashist) => lashist.deletedAt === null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Lash Artists</h1>
        <div className="flex items-center gap-2">
          <Switch
            id="show-deleted"
            checked={showDeleted}
            onCheckedChange={setShowDeleted}
            className="cursor-pointer"
          />
          <Label htmlFor="show-deleted" className="cursor-pointer">
            Deactivated
          </Label>
        </div>
      </div>

      <LashistsTable
        lashists={filteredLashists}
        showDeleted={showDeleted}
        canUpdate={permissions["lashists.update"]}
        canAssignLashist={permissions["users.assign-lashist"]}
      />
    </div>
  );
}
