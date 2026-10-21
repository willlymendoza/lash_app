"use client";

import { formatPrice } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getAppointmentStatusBadgeClass,
  getAppointmentStatusLabel,
} from "../constants/appointment-status";
import type { AppointmentStatus } from "../types";

type CalendarEventTooltipProps = {
  children: ReactNode;
  appointment: {
    client: {
      firstName: string;
      lastName: string | null;
    };
    lashist: {
      fullName: string;
    };
    serviceNameSnapshot: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    activeDeposit?: {
      amount: string;
    } | null;
  };
};

export function CalendarEventTooltip({
  children,
  appointment,
}: CalendarEventTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">
              {appointment.client.firstName} {appointment.client.lastName || ""}
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span>{appointment.serviceNameSnapshot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lash artist:</span>
                <span>{appointment.lashist.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span>
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit:</span>
                <span>
                  {appointment.activeDeposit
                    ? formatPrice(appointment.activeDeposit.amount)
                    : "No deposit"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getAppointmentStatusBadgeClass(appointment.status)}>
                  {getAppointmentStatusLabel(appointment.status)}
                </Badge>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
