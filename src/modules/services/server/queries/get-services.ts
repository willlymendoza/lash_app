import "server-only";

import { and, desc, eq, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import { services } from "@/db/schema";

export async function getServices(
  showDeleted: boolean = false,
  showInactive: boolean = false,
) {
  const whereClause = and(
    showDeleted ? undefined : isNull(services.deletedAt),
    showInactive ? undefined : eq(services.isActive, true),
  );

  const servicesList = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      basePrice: services.basePrice,
      estimatedDurationMinutes: services.estimatedDurationMinutes,
      imageUrl: services.imageUrl,
      isActive: services.isActive,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
      deletedAt: services.deletedAt,
    })
    .from(services)
    .where(whereClause)
    .orderBy(desc(services.createdAt));

  return servicesList;
}
