import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { services } from "@/db/schema";

export async function getServiceById(
  id: number,
  includeDeleted: boolean = false,
) {
  const whereClause = includeDeleted
    ? eq(services.id, id)
    : and(eq(services.id, id), isNull(services.deletedAt));

  const [service] = await db
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
    .limit(1);

  return service;
}
