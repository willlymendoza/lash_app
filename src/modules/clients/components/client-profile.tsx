"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ClientProfileCard } from "@/modules/clients/components/client-profile-card";
import { ClientNotesList } from "@/modules/clients/components/client-notes-list";
import { AddClientNoteDialog } from "@/modules/clients/components/add-client-note-dialog";
import { EditClientNoteDialog } from "@/modules/clients/components/edit-client-note-dialog";

type ClientProfileProps = {
  client: {
    id: number;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    instagram: string | null;
    email: string | null;
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
    createdByName: string;
  }>;
  permissions: Record<string, boolean>;
};

export function ClientProfile({
  client,
  notes,
  permissions,
}: ClientProfileProps) {
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [editNoteState, setEditNoteState] = useState<{
    noteId: number;
    clientId: number;
    currentTitle: string | null;
    currentNote: string;
  } | null>(null);
  const [showDeletedNotes, setShowDeletedNotes] = useState(false);

  const handleAddNote = () => {
    setIsAddNoteDialogOpen(true);
  };

  const handleEditNote = (
    noteId: number,
    clientId: number,
    currentTitle: string | null,
    currentNote: string,
  ) => {
    setEditNoteState({ noteId, clientId, currentTitle, currentNote });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Link href="/clients">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-ink-700 hover:bg-surface-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to list
          </Button>
        </Link>
      </div>

      {/* Client details */}
      <ClientProfileCard
        client={client}
        canUpdate={permissions["clients.update"]}
        canRemove={permissions["clients.remove"]}
        canRestore={permissions["clients.restore"]}
      />

      {/* Client notes */}
      <Card className="bg-surface-0 border-ink-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-ink-900">Client Notes</CardTitle>
            <div className="flex items-center gap-3">
              {permissions["clients.add-note"] && (
                <Button
                  onClick={handleAddNote}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-amber-200 text-amber-600 hover:bg-amber-50"
                >
                  Add note
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={showDeletedNotes}
                  onCheckedChange={setShowDeletedNotes}
                  className="cursor-pointer"
                />
                <span className="text-sm text-ink-700">Show deleted</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ClientNotesList
            notes={notes}
            showDeleted={showDeletedNotes}
            canEditNote={permissions["clients.edit-note"]}
            canDeleteNote={permissions["clients.delete-note"]}
            canRestoreNote={permissions["clients.restore-note"]}
            onEditNote={handleEditNote}
          />
        </CardContent>
      </Card>

      {/* Add note dialog */}
      <AddClientNoteDialog
        clientId={client.id}
        open={isAddNoteDialogOpen}
        onOpenChange={setIsAddNoteDialogOpen}
      />

      {/* Edit note dialog */}
      {editNoteState && (
        <EditClientNoteDialog
          noteId={editNoteState.noteId}
          clientId={editNoteState.clientId}
          currentTitle={editNoteState.currentTitle}
          currentNote={editNoteState.currentNote}
          open={!!editNoteState}
          onOpenChange={(open) => {
            if (!open) setEditNoteState(null);
          }}
        />
      )}

      {/* Client history placeholder */}
      <Card className="bg-surface-0 border-ink-200">
        <CardHeader>
          <CardTitle className="text-ink-900">Client History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-500">
            Coming soon: appointment count, last appointment, and total spent.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
