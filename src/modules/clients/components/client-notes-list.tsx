"use client";

import { appConfig } from "@/lib/app-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteClientNoteAlertDialog } from "@/modules/clients/components/delete-client-note-alert-dialog";
import { RestoreClientNoteButton } from "@/modules/clients/components/restore-client-note-button";

type ClientNoteRow = {
  id: number;
  clientId: number;
  title: string | null;
  note: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdByName: string;
};

type ClientNotesListProps = {
  notes: ClientNoteRow[];
  showDeleted: boolean;
  canAddNote?: boolean;
  canEditNote: boolean;
  canDeleteNote: boolean;
  canRestoreNote: boolean;
  onAddNote?: () => void;
  onEditNote?: (
    noteId: number,
    clientId: number,
    currentTitle: string | null,
    currentNote: string,
  ) => void;
};

export function ClientNotesList({
  notes,
  showDeleted,
  canEditNote,
  canDeleteNote,
  canRestoreNote,
  onEditNote,
}: ClientNotesListProps) {
  const filteredNotes = showDeleted
    ? notes
    : notes.filter((note) => note.deletedAt === null);

  return (
    <div className="flex flex-col gap-4">
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {showDeleted
                ? "No deleted notes."
                : "No notes for this client."}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredNotes.map((note) => {
        const isDeleted = note.deletedAt !== null;

        return (
          <Card
            key={note.id}
            className={isDeleted ? "bg-surface-100 border-ink-200" : "bg-surface-0 border-ink-200"}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  {note.title && (
                    <CardTitle className="text-sm font-medium mb-1">
                      {note.title}
                    </CardTitle>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {note.createdByName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {canEditNote && !isDeleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100"
                      onClick={() =>
                        onEditNote?.(
                          note.id,
                          note.clientId,
                          note.title,
                          note.note,
                        )
                      }
                    >
                      Edit
                    </Button>
                  )}
                  {canDeleteNote && !isDeleted && (
                    <DeleteClientNoteAlertDialog
                      noteId={note.id}
                      clientId={note.clientId}
                      noteTitle={note.title}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </DeleteClientNoteAlertDialog>
                  )}
                  {canRestoreNote && isDeleted && (
                    <RestoreClientNoteButton
                      noteId={note.id}
                      clientId={note.clientId}
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString(appConfig.locale, {
                  timeZone: appConfig.timeZone,
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{note.note}</p>
            </CardContent>
          </Card>
        );
      })
      )}
    </div>
  );
}
