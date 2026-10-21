import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { clientNotes, clients, users } from "@/db/schema";

export interface ClientProfileResult {
  client: {
    id: number;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    instagram: string | null;
    email: string | null;
    birthDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  };
  notes: Array<{
    id: number;
    clientId: number;
    title: string | null;
    note: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    createdByUserId: number;
    createdByName: string;
  }>;
}

interface GetClientProfileProps {
  clientId: number;
  includeDeletedClient?: boolean;
  includeDeletedNotes?: boolean;
}

export async function getClientProfile({
  clientId,
  includeDeletedClient = false,
  includeDeletedNotes = false,
}: GetClientProfileProps): Promise<ClientProfileResult | null> {
  const clientWhereClause = includeDeletedClient
    ? eq(clients.id, clientId)
    : and(eq(clients.id, clientId), isNull(clients.deletedAt));

  const notesWhereClause = includeDeletedNotes
    ? eq(clientNotes.clientId, clientId)
    : and(eq(clientNotes.clientId, clientId), isNull(clientNotes.deletedAt));

  const [client, notes] = await Promise.all([
    db
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
      .where(clientWhereClause)
      .limit(1),
    db
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
      .where(notesWhereClause)
      .orderBy(desc(clientNotes.createdAt)),
  ]);

  const [clientRow] = client;

  if (!clientRow) {
    return null;
  }

  return {
    client: clientRow,
    notes,
  };
}
