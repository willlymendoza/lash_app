import "../lib/env";

import { db } from "../db";
import { paymentMethods } from "../db/schema";

const SYSTEM_PAYMENT_METHODS = [
  {
    code: "cash",
    name: "Cash",
    description: "Cash payment",
    sortOrder: 1,
  },
  {
    code: "card",
    name: "Card",
    description: "Card payment",
    sortOrder: 2,
  },
  {
    code: "bank_transfer",
    name: "Bank transfer",
    description: "Bank transfer payment",
    sortOrder: 3,
  },
  {
    code: "bank_deposit",
    name: "Bank deposit",
    description: "Bank deposit payment",
    sortOrder: 4,
  },
  {
    code: "check",
    name: "Check",
    description: "Check payment",
    sortOrder: 5,
  },
] as const;

export async function seedPaymentMethods() {
  for (const paymentMethod of SYSTEM_PAYMENT_METHODS) {
    await db
      .insert(paymentMethods)
      .values({
        code: paymentMethod.code,
        name: paymentMethod.name,
        description: paymentMethod.description,
        sortOrder: paymentMethod.sortOrder,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: paymentMethods.code,
        set: {
          name: paymentMethod.name,
          description: paymentMethod.description,
          sortOrder: paymentMethod.sortOrder,
          isActive: true,
          deletedAt: null,
          updatedAt: new Date(),
        },
      });
  }

  console.log(
    `Payment methods synchronized: ${SYSTEM_PAYMENT_METHODS.length}`,
  );
}
