"use client";

import { Edit, MoreVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TogglePaymentMethodActiveForm } from "@/modules/payment-methods/components/toggle-payment-method-active-form";

type PaymentMethodActionsMenuProps = {
  paymentMethodId: number;
  isActive: boolean;
  canUpdate: boolean;
  canToggleActive: boolean;
  onEdit?: () => void;
};

export function PaymentMethodActionsMenu({
  paymentMethodId,
  isActive,
  canUpdate,
  canToggleActive,
  onEdit,
}: PaymentMethodActionsMenuProps) {
  const hasActions = canUpdate || canToggleActive;

  if (!hasActions) {
    return null;
  }

  return (
    <DropdownMenu key={`dropdown-${paymentMethodId}`}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-2 py-2 text-sm text-ink-700 hover:bg-surface-100 cursor-pointer"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-surface-0 border-ink-200">
        {canUpdate && (
          <DropdownMenuItem
            onSelect={() => {
              onEdit?.();
            }}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {canToggleActive && (
          <DropdownMenuItem asChild>
            <TogglePaymentMethodActiveForm
              paymentMethodId={paymentMethodId}
              isActive={isActive}
            />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
