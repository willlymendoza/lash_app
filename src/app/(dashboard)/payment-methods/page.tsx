import type { Metadata } from "next";

import {
  hasPermissions,
  requirePermission,
} from "@/modules/permissions/server/queries";
import { getPaymentMethods } from "@/modules/payment-methods/server/queries/get-payment-methods";
import { PaymentMethodsManagement } from "@/modules/payment-methods/components/payment-methods-management";

export const metadata: Metadata = {
  title: "Payment Methods",
};

export default async function PaymentMethodsPage() {
  await requirePermission("payment-methods.read");

  const permissions = await hasPermissions([
    "payment-methods.read",
    "payment-methods.update",
    "payment-methods.toggle-active",
  ]);

  const paymentMethods = await getPaymentMethods(true);

  return (
    <PaymentMethodsManagement
      paymentMethods={paymentMethods}
      permissions={permissions}
    />
  );
}
