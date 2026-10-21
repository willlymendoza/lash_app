"use client";

import { PaymentMethodActionsMenu } from "@/modules/payment-methods/components/payment-methods-actions-menu";

type PaymentMethodActionsDropdownProps = {
  paymentMethodId: number;
  isActive: boolean;
  canUpdate: boolean;
  canToggleActive: boolean;
  onEdit?: () => void;
};

export function PaymentMethodActionsDropdown({
  paymentMethodId,
  isActive,
  canUpdate,
  canToggleActive,
  onEdit,
}: PaymentMethodActionsDropdownProps) {
  return (
    <PaymentMethodActionsMenu
      paymentMethodId={paymentMethodId}
      isActive={isActive}
      canUpdate={canUpdate}
      canToggleActive={canToggleActive}
      onEdit={onEdit}
    />
  );
}
