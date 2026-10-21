"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { formatISODateOnly } from "@/lib/utils/date";
import { formatTime } from "@/lib/utils/time";
import type { AppointmentRescheduleEntry } from "../types";

type AppointmentReschedulesListProps = {
  reschedules: AppointmentRescheduleEntry[];
};

export function AppointmentReschedulesList({
  reschedules,
}: AppointmentReschedulesListProps) {
  if (reschedules.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No rescheduling history.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reschedules.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {format(new Date(entry.createdAt), "dd/MM/yyyy hh:mm a")}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                by {entry.createdByUser?.fullName || "Unknown user"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">From:</span>
                <span className="font-medium">
                  {formatISODateOnly(entry.oldDate)} -{" "}
                  {formatTime(entry.oldStartTime)} a {formatTime(entry.oldEndTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">
                  {formatISODateOnly(entry.newDate)} -{" "}
                  {formatTime(entry.newStartTime)} a {formatTime(entry.newEndTime)}
                </span>
              </div>
              {entry.note && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {entry.note}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
