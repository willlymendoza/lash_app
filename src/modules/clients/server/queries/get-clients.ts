import "server-only";

import { desc, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import { clients } from "@/db/schema";

export async function getClients(includeDeleted: boolean = false) {
  const whereClause = includeDeleted ? undefined : isNull(clients.deletedAt);

  const clientsList = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      phone: clients.phone,
      address: clients.address,
      instagram: clients.instagram,
      email: clients.email,
      birthDate: clients.birthDate,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      deletedAt: clients.deletedAt,
    })
    .from(clients)
    .where(whereClause)
    .orderBy(desc(clients.createdAt));

  return clientsList;
}
