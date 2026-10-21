import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { clients } from "@/db/schema";

export async function getClientById(
  id: number,
  includeDeleted: boolean = false,
) {
  const whereClause = includeDeleted
    ? eq(clients.id, id)
    : and(eq(clients.id, id), isNull(clients.deletedAt));

  const [client] = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      phone: clients.phone,
      address: clients.address,
      instagram: clients.instagram,
      email: clients.email,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      deletedAt: clients.deletedAt,
    })
    .from(clients)
    .where(whereClause)
    .limit(1);

  return client;
}
