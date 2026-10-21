"use client";

import { formatPrice } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatTime } from "@/lib/utils/time";
import { formatDate } from "@/lib/utils/date";
import {
  getAppointmentStatusBadgeClass,
  getAppointmentStatusLabel,
} from "../constants/appointment-status";
import type { AppointmentListItem } from "../types";

type AppointmentCardProps = {
  appointment: Pick<
    AppointmentListItem,
    | "id"
    | "status"
    | "appointmentDate"
    | "startTime"
    | "endTime"
    | "durationMinutes"
    | "notes"
    | "serviceNameSnapshot"
    | "servicePriceSnapshot"
    | "client"
    | "lashist"
    | "activeDeposit"
  >;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
}: AppointmentCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {appointment.client.firstName} {appointment.client.lastName || ""}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={getAppointmentStatusBadgeClass(appointment.status)}>
            {getAppointmentStatusLabel(appointment.status)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(appointment.id)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(appointment.id)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">
              {appointment.serviceNameSnapshot}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lash artist:</span>
            <span className="font-medium">
              {appointment.lashist.fullName || "Sin asignar"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">
              {formatDate(appointment.appointmentDate, "long")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">
              {formatTime(appointment.startTime)} -{" "}
              {formatTime(appointment.endTime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">
              {appointment.durationMinutes} min
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">
              {formatPrice(appointment.servicePriceSnapshot ?? "0")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deposit:</span>
            <span className="font-medium">
              {appointment.activeDeposit
                ? formatPrice(appointment.activeDeposit.amount)
                : "No deposit"}
            </span>
          </div>
          {appointment.notes && (
            <div className="pt-2 border-t">
              <span className="text-muted-foreground">Notes:</span>
              <p className="mt-1">{appointment.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
