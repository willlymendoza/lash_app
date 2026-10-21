"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type PaymentMethodsHeaderProps = {
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
};

export function PaymentMethodsHeader({
  showInactive,
  onShowInactiveChange,
}: PaymentMethodsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-ink-900">Payment Methods</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={onShowInactiveChange}
            className="cursor-pointer"
          />
          <Label htmlFor="show-inactive" className="cursor-pointer">
            Inactive
          </Label>
        </div>
      </div>
    </div>
  );
}
