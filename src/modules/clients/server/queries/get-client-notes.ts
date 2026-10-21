import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { clientNotes, users } from "@/db/schema";

export async function getClientNotes(
  clientId: number,
  includeDeleted: boolean = false,
) {
  const whereClause = includeDeleted
    ? eq(clientNotes.clientId, clientId)
    : and(eq(clientNotes.clientId, clientId), isNull(clientNotes.deletedAt));

  const notes = await db
    .select({
      id: clientNotes.id,
      clientId: clientNotes.clientId,
      title: clientNotes.title,
      note: clientNotes.note,
      createdAt: clientNotes.createdAt,
      updatedAt: clientNotes.updatedAt,
      deletedAt: clientNotes.deletedAt,
      createdByUserId: clientNotes.createdByUserId,
      createdByName: users.fullName,
    })
    .from(clientNotes)
    .innerJoin(users, eq(clientNotes.createdByUserId, users.id))
    .where(whereClause)
    .orderBy(desc(clientNotes.createdAt));

  return notes;
}
