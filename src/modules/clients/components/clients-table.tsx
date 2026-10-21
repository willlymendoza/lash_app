"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientActionsDropdownMenu } from "@/modules/clients/components/client-actions-dropdown-menu";
import { formatDate } from "@/lib/utils/date";

type ClientRow = {
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

type ClientsTableProps = {
  clients: ClientRow[];
  showDeleted: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canAddNote: boolean;
  canRemove: boolean;
  canRestore: boolean;
};

export function ClientsTable({
  clients,
  showDeleted,
  canCreate,
  canUpdate,
  canAddNote,
  canRemove,
  canRestore,
}: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-ink-200 rounded-lg bg-surface-0">
        <p className="text-ink-500 text-sm">
          {showDeleted
            ? "No deleted clients"
            : "No clients registered"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-50 border-b-ink-200 hover:bg-surface-50">
            <TableHead className="text-ink-700 font-semibold">Name</TableHead>
            <TableHead className="text-ink-700 font-semibold">Email</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Phone
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Date of birth
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Instagram
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">Status</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              View profile
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const fullName =
              `${client.firstName} ${client.lastName || ""}`.trim();
            const isDeleted = client.deletedAt !== null;

            return (
              <TableRow
                key={client.id}
                className="border-b-ink-200 hover:bg-surface-50 transition-colors"
              >
                <TableCell className="font-medium text-ink-900">
                  {fullName}
                </TableCell>
                <TableCell className="text-ink-700">
                  {client.email ? (
                    client.email
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-ink-700">
                  {client.phone ? (
                    client.phone
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-ink-700">
                  {client.birthDate ? (
                    formatDate(client.birthDate, "short")
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-ink-700">
                  {client.instagram ? (
                    client.instagram
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isDeleted ? "outline" : "secondary"}
                    className={
                      isDeleted
                        ? "border-ink-200 text-ink-500"
                        : "bg-emerald-50 text-emerald-600 border-emerald-50"
                    }
                  >
                    {isDeleted ? "Deleted" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-ink-200 text-ink-700 hover:bg-surface-100 cursor-pointer"
                  >
                    <Link href={`/clients/${client.id}`}>View profile</Link>
                  </Button>
                </TableCell>
                <TableCell>
                  <ClientActionsDropdownMenu
                    clientId={client.id}
                    clientName={fullName}
                    client={client}
                    isDeleted={isDeleted}
                    canUpdate={canUpdate}
                    canAddNote={canAddNote}
                    canRemove={canRemove}
                    canRestore={canRestore}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
