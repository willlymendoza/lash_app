export type PaymentMethodSnapshotSource = {
  id: number;
  code: string;
  name: string;
};

export function createPaymentMethodSnapshot(
  paymentMethod: PaymentMethodSnapshotSource,
) {
  return {
    paymentMethodId: paymentMethod.id,
    paymentMethodCodeSnapshot: paymentMethod.code,
    paymentMethodNameSnapshot: paymentMethod.name,
  };
}
