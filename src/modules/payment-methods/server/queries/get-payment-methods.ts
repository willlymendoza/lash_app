import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { paymentMethods } from "@/db/schema";

export async function getPaymentMethods(showInactive: boolean = false) {
  const whereClause = and(
    isNull(paymentMethods.deletedAt),
    showInactive ? undefined : eq(paymentMethods.isActive, true),
  );

  const paymentMethodsList = await db
    .select({
      id: paymentMethods.id,
      code: paymentMethods.code,
      name: paymentMethods.name,
      description: paymentMethods.description,
      isActive: paymentMethods.isActive,
      sortOrder: paymentMethods.sortOrder,
      createdAt: paymentMethods.createdAt,
      updatedAt: paymentMethods.updatedAt,
      deletedAt: paymentMethods.deletedAt,
    })
    .from(paymentMethods)
    .where(whereClause)
    .orderBy(paymentMethods.sortOrder, desc(paymentMethods.createdAt));

  return paymentMethodsList;
}
