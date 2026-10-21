"use client";

import { appConfig } from "@/lib/app-config";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LashistActionsDropdownMenu } from "@/modules/lashists/components/lashist-actions-dropdown-menu";

type LashistRow = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  defaultCommissionType: string;
  defaultCommissionValue: number;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type LashistsTableProps = {
  lashists: LashistRow[];
  showDeleted: boolean;
  canUpdate: boolean;
  canAssignLashist: boolean;
};

export function LashistsTable({
  lashists,
  showDeleted,
  canUpdate,
  canAssignLashist,
}: LashistsTableProps) {
  if (lashists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-ink-200 rounded-lg bg-surface-0">
        <p className="text-ink-500 text-sm">
          {showDeleted
            ? "No deactivated lash artists"
            : "No lash artists registered"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-50 border-b-ink-200 hover:bg-surface-50">
            <TableHead className="text-ink-700 font-semibold">Name</TableHead>
            <TableHead className="text-ink-700 font-semibold">Email</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Phone
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Commission type
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Commission value
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">Status</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lashists.map((lashist) => {
            const isDeleted = lashist.deletedAt !== null;
            const commissionTypeLabel =
              lashist.defaultCommissionType === "percent" ? "%" : appConfig.currencySymbol;

            return (
              <TableRow
                key={lashist.id}
                className="border-b-ink-200 hover:bg-surface-50 transition-colors"
              >
                <TableCell className="font-medium text-ink-900">
                  {lashist.fullName}
                </TableCell>
                <TableCell className="text-ink-700">{lashist.email}</TableCell>
                <TableCell className="text-ink-700">
                  {lashist.phone ? (
                    lashist.phone
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-ink-700">
                  {lashist.defaultCommissionType === "percent"
                    ? "Percentage"
                    : "Fixed"}
                </TableCell>
                <TableCell className="text-ink-700">
                  {lashist.defaultCommissionType === "percent" ? (
                    <>
                      {lashist.defaultCommissionValue} {commissionTypeLabel}
                    </>
                  ) : (
                    <>
                      {commissionTypeLabel} {lashist.defaultCommissionValue}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isDeleted ? "outline" : "secondary"}
                    className={
                      isDeleted
                        ? "border-ink-200 text-ink-500"
                        : "bg-emerald-50 text-emerald-600 border-emerald-50"
                    }
                  >
                    {isDeleted ? "Deactivated" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <LashistActionsDropdownMenu
                    lashistId={lashist.id}
                    lashistName={lashist.fullName}
                    defaultCommissionType={lashist.defaultCommissionType}
                    defaultCommissionValue={lashist.defaultCommissionValue}
                    color={lashist.color}
                    isDeleted={isDeleted}
                    canUpdate={canUpdate}
                    canAssignLashist={canAssignLashist}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
