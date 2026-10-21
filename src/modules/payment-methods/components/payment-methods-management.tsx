"use client";

import { useState } from "react";

import { PaymentMethodsHeader } from "@/modules/payment-methods/components/payment-methods-header";
import { EditPaymentMethodDialog } from "@/modules/payment-methods/components/edit-payment-method-dialog";
import { PaymentMethodsTable } from "@/modules/payment-methods/components/payment-methods-table";
import { usePathname } from "next/navigation";

type PaymentMethodsManagementProps = {
  paymentMethods: Array<{
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    sortOrder: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  permissions: Record<string, boolean>;
};

export function PaymentMethodsManagement({
  paymentMethods,
  permissions,
}: PaymentMethodsManagementProps) {
  const pathname = usePathname();
  const [showInactive, setShowInactive] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<{
    id: number;
    description: string | null;
    sortOrder: number | null;
  } | null>(null);

  const filteredPaymentMethods = paymentMethods.filter((paymentMethod) => {
    if (showInactive && !paymentMethod.isActive) return true;
    if (!showInactive && !paymentMethod.isActive) return false;
    return true;
  });

  const handleEdit = (
    paymentMethodId: number,
    paymentMethod: PaymentMethodsManagementProps["paymentMethods"][number],
  ) => {
    setEditingPaymentMethod({
      id: paymentMethodId,
      description: paymentMethod.description,
      sortOrder: paymentMethod.sortOrder,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4" key={pathname}>
      <PaymentMethodsHeader
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
      />

      <PaymentMethodsTable
        paymentMethods={filteredPaymentMethods}
        showInactive={showInactive}
        permissions={permissions}
        onEdit={handleEdit}
      />

      {editingPaymentMethod && (
        <EditPaymentMethodDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          paymentMethodId={editingPaymentMethod.id}
          initialData={editingPaymentMethod}
        />
      )}
    </div>
  );
}
