"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentMethodActionsDropdown } from "@/modules/payment-methods/components/payment-methods-actions-dropdown";

type PaymentMethodRow = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type PaymentMethodsTableProps = {
  paymentMethods: PaymentMethodRow[];
  showInactive: boolean;
  permissions: Record<string, boolean>;
  onEdit: (paymentMethodId: number, paymentMethod: PaymentMethodRow) => void;
};

export function PaymentMethodsTable({
  paymentMethods,
  showInactive,
  permissions,
  onEdit,
}: PaymentMethodsTableProps) {
  const canUpdate = permissions["payment-methods.update"] ?? false;
  const canToggleActive = permissions["payment-methods.toggle-active"] ?? false;

  if (paymentMethods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-ink-200 rounded-lg bg-surface-0">
        <p className="text-ink-500 text-sm">
          {showInactive
            ? "No inactive payment methods"
            : "No payment methods registered"}
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
            <TableHead className="text-ink-700 font-semibold">
              Description
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">Order</TableHead>
            <TableHead className="text-ink-700 font-semibold">Status</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentMethods.map((paymentMethod) => {
            const isInactive = !paymentMethod.isActive;

            return (
              <TableRow
                key={paymentMethod.id}
                className="border-b-ink-200 hover:bg-surface-50 transition-colors"
              >
                <TableCell className="text-ink-700">
                  {paymentMethod.name}
                </TableCell>
                <TableCell className="text-ink-700">
                  {paymentMethod.description ? (
                    <span className="line-clamp-2">
                      {paymentMethod.description}
                    </span>
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-ink-700">
                  {paymentMethod.sortOrder ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isInactive ? "outline" : "secondary"}
                    className={
                      isInactive
                        ? "border-ink-200 text-ink-500"
                        : "bg-emerald-50 text-emerald-600 border-emerald-50"
                    }
                  >
                    {isInactive ? "Inactive" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <PaymentMethodActionsDropdown
                    paymentMethodId={paymentMethod.id}
                    isActive={paymentMethod.isActive}
                    canUpdate={canUpdate}
                    canToggleActive={canToggleActive}
                    onEdit={() => onEdit(paymentMethod.id, paymentMethod)}
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
