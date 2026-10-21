"use client";

import { formatPrice } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil } from "lucide-react";
import { formatTime } from "@/lib/utils/time";
import {
  getAppointmentStatusBadgeClass,
  getAppointmentStatusLabel,
} from "../constants/appointment-status";
import type { AppointmentListItem } from "../types";

type AppointmentsTableProps = {
  appointments: AppointmentListItem[];
  onOpenAppointment?: (id: number) => void;
};

export function AppointmentsTable({
  appointments,
  onOpenAppointment,
}: AppointmentsTableProps) {
  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No appointments registered.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Lash Artist</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Deposit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow
              key={appointment.id}
              className={
                appointment.deletedAt
                  ? "opacity-50 bg-red-50"
                  : appointment.status === "cancelled" ||
                      appointment.status === "no_show"
                    ? "opacity-60"
                    : ""
              }
            >
              <TableCell className="font-medium">
                <div className={appointment.deletedAt ? "line-through" : ""}>
                  {appointment.client.firstName} {appointment.client.lastName || ""}
                </div>
              </TableCell>

              <TableCell>
                <div className={appointment.deletedAt ? "line-through" : ""}>
                  <div className="flex items-center gap-2">
                    {appointment.lashist.color && (
                      <div
                        className="size-3 rounded-full border"
                        style={{ backgroundColor: appointment.lashist.color }}
                      />
                    )}
                    <span>{appointment.lashist.fullName || "Sin asignar"}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className={appointment.deletedAt ? "line-through" : ""}>
                  {appointment.serviceNameSnapshot}
                </div>
              </TableCell>

              <TableCell>
                <div className={appointment.deletedAt ? "line-through" : ""}>
                  {formatDate(appointment.appointmentDate)}
                </div>
              </TableCell>

              <TableCell>
                <div className={appointment.deletedAt ? "line-through" : ""}>
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </div>
              </TableCell>

              <TableCell>
                {appointment.activeDeposit ? (
                  <div className="text-sm">
                    <div className="font-medium">
                      {formatPrice(appointment.activeDeposit.amount ?? "0")}
                    </div>
                    <div className="text-muted-foreground">
                      {appointment.activeDeposit.paymentMethodNameSnapshot}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No deposit</span>
                )}
              </TableCell>

              <TableCell>
                <Badge
                  className={`${getAppointmentStatusBadgeClass(appointment.status)} ${appointment.deletedAt ? "opacity-70" : ""}`}
                >
                  {getAppointmentStatusLabel(appointment.status)}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                {onOpenAppointment && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenAppointment(appointment.id)}
                    aria-label={
                      appointment.status === "cancelled" ||
                      appointment.status === "no_show"
                        ? "View appointment"
                        : "Edit appointment"
                    }
                    title={
                      appointment.status === "cancelled" ||
                      appointment.status === "no_show"
                        ? "View appointment"
                        : "Edit appointment"
                    }
                  >
                    {appointment.status === "cancelled" ||
                    appointment.status === "no_show" ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
