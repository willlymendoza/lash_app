"use client";

import { appConfig } from "@/lib/app-config";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import enGbLocale from "@fullcalendar/core/locales/en-gb";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { CSSProperties } from "react";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  APPOINTMENT_STATUS_CALENDAR_BACKGROUND,
  APPOINTMENT_STATUS_CALENDAR_TEXT,
  isAppointmentStatus,
} from "../constants/appointment-status";
import type { AppointmentListItem } from "../types";

type AppointmentCalendarProps = {
  appointments: AppointmentListItem[];
  lashistFilter?: number | null;
  onEventClick?: (appointmentId: number) => void;
  onSlotClick?: (date: Date, startTime: string) => void;
};

export function AppointmentCalendar({
  appointments,
  lashistFilter,
  onEventClick,
  onSlotClick,
}: AppointmentCalendarProps) {
  const events = appointments
    .filter(
      (appointment) =>
        appointment.status !== "cancelled" && appointment.status !== "no_show",
    )
    .filter((appointment) => !lashistFilter || appointment.lashist.id === lashistFilter)
    .map((appointment) => {
      const startISO = `${appointment.appointmentDate}T${appointment.startTime}`;
      const endISO = `${appointment.appointmentDate}T${appointment.endTime}`;

      const backgroundColor = appointment.lashist.color || getStatusBackgroundColor(appointment.status);
      const textColor = appointment.lashist.color ? "#000000" : getStatusTextColor(appointment.status);

      return {
        id: String(appointment.id),
        title: `${appointment.client.firstName} ${appointment.client.lastName || ""} - ${appointment.serviceNameSnapshot}`,
        start: startISO,
        end: endISO,
        extendedProps: {
          appointmentId: appointment.id,
        },
        backgroundColor,
        textColor,
      };
    });

  const handleEventClick = (info: EventClickArg) => {
    const appointmentId = Number(info.event.extendedProps["appointmentId"]);

    if (Number.isFinite(appointmentId)) {
      onEventClick?.(appointmentId);
    }
  };

  const handleSlotClick = (info: DateClickArg) => {
    const parsedDate = parseISO(info.dateStr);
    const startTime = format(parsedDate, "HH:mm");
    const zonedDate = toZonedTime(parsedDate, appConfig.timeZone);

    onSlotClick?.(zonedDate, startTime);
  };

  return (
    <div
      className="h-150"
      style={{
        "--fc-today-bg-color": "#f0f9ff",
      } as CSSProperties}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        timeZone={appConfig.timeZone}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale={enGbLocale}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleSlotClick}
        selectable={true}
        slotDuration="00:30:00"
        allDaySlot={false}
        height="100%"
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }}
        slotEventOverlap={false}
      />
    </div>
  );
}

function getStatusBackgroundColor(status: string): string {
  if (!isAppointmentStatus(status)) {
    return "#e5e7eb";
  }

  return APPOINTMENT_STATUS_CALENDAR_BACKGROUND[status];
}

function getStatusTextColor(status: string): string {
  if (!isAppointmentStatus(status)) {
    return "#374151";
  }

  return APPOINTMENT_STATUS_CALENDAR_TEXT[status];
}
