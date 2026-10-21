"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  getAppointmentStatusBadgeClass,
  getAppointmentStatusLabel,
} from "../constants/appointment-status";
import type { AppointmentStatusHistoryEntry } from "../types";

type AppointmentStatusHistoryListProps = {
  history: AppointmentStatusHistoryEntry[];
};

export function AppointmentStatusHistoryList({
  history,
}: AppointmentStatusHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No status change history.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {format(new Date(entry.changedAt), "dd/MM/yyyy HH:mm")}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                by {entry.changedByUser?.fullName || "Unknown user"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              {entry.oldStatus && (
                <>
                  <Badge
                    className={getAppointmentStatusBadgeClass(entry.oldStatus)}
                  >
                    {getAppointmentStatusLabel(entry.oldStatus)}
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                </>
              )}
              <Badge
                className={getAppointmentStatusBadgeClass(entry.newStatus)}
              >
                {getAppointmentStatusLabel(entry.newStatus)}
              </Badge>
            </div>
            {entry.note && (
              <p className="mt-2 text-sm text-muted-foreground">{entry.note}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
