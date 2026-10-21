"use client";

import { appConfig } from "@/lib/app-config";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  getGuatemalaPresetDateRange,
  resolveCustomDateRange,
  type DateFilterPreset,
} from "@/lib/utils/date";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAppointmentDetails } from "../server/actions/get-appointment-details";
import { AppointmentsViewTabs } from "./appointments-view-tabs";
import { AppointmentCreateDialog } from "./appointment-create-dialog";
import { AppointmentEditDialog } from "./appointment-edit-dialog";
import type {
  AppointmentRescheduleEntry,
  AppointmentStatusHistoryEntry,
  AppointmentsManagementProps,
} from "../types";

export function AppointmentsManagement({
  activeAppointments,
  clients,
  lashists,
  services,
  paymentMethods,
  permissions,
}: AppointmentsManagementProps) {
  const router = useRouter();
  const canCreate = permissions["appointments.create"] ?? false;
  const canUpdate = permissions["appointments.update"] ?? false;
  const canCancel = permissions["appointments.cancel"] ?? false;
  const canNoShow = permissions["appointments.no-show"] ?? false;
  const canCreateDeposit = permissions["appointment-advances.create"] ?? false;
  const canVoidDeposit = permissions["appointment-advances.void"] ?? false;

  const [showCancelledNoShow, setShowCancelledNoShow] = useState(false);
  const [selectedLashistId, setSelectedLashistId] = useState<number | null>(
    null,
  );
  const [dateFilterPreset, setDateFilterPreset] =
    useState<DateFilterPreset>("today");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const [initialStartTime, setInitialStartTime] = useState<string>("");
  const [statusHistory, setStatusHistory] = useState<
    AppointmentStatusHistoryEntry[]
  >([]);
  const [reschedules, setReschedules] = useState<AppointmentRescheduleEntry[]>(
    [],
  );

  const selectedAppointment = activeAppointments.find(
    (appointment) => appointment.id === selectedAppointmentId,
  );

  const calendarAppointments = activeAppointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" && appointment.status !== "no_show",
  );

  const tableAppointments = activeAppointments
    .filter((appointment) => {
      if (showCancelledNoShow) {
        return true;
      }

      return (
        appointment.status !== "cancelled" && appointment.status !== "no_show"
      );
    })
    .filter(
      (appointment) =>
        selectedLashistId === null || appointment.lashist.id === selectedLashistId,
    )
    .filter((appointment) => {
      if (dateFilterPreset === "all") {
        return true;
      }

      if (dateFilterPreset === "custom") {
        const customRange = resolveCustomDateRange(customDateRange);
        if (!customRange) {
          return true;
        }

        return (
          appointment.appointmentDate >= customRange.startDate &&
          appointment.appointmentDate <= customRange.endDate
        );
      }

      const presetRange = getGuatemalaPresetDateRange(
        dateFilterPreset === "today" ||
          dateFilterPreset === "week" ||
          dateFilterPreset === "month"
          ? dateFilterPreset
          : "today",
      );

      return (
        appointment.appointmentDate >= presetRange.startDate &&
        appointment.appointmentDate <= presetRange.endDate
      );
    })
    .toSorted((a, b) => {
      const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }

      const lashistA = (a.lashist.fullName || "").toLocaleLowerCase(appConfig.locale);
      const lashistB = (b.lashist.fullName || "").toLocaleLowerCase(appConfig.locale);
      const lashistCompare = lashistA.localeCompare(lashistB, appConfig.locale);
      if (lashistCompare !== 0) {
        return lashistCompare;
      }

      return a.startTime.localeCompare(b.startTime);
    });

  const loadAppointmentDetails = async (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);

    try {
      const appointmentDetails = await getAppointmentDetails(appointmentId);
      setStatusHistory(appointmentDetails.statusHistory);
      setReschedules(appointmentDetails.reschedules);
    } catch {
      setStatusHistory([]);
      setReschedules([]);
      toast.error("Could not load the appointment history.");
    }
  };

  const handleOpenAppointment = async (appointmentId: number) => {
    await loadAppointmentDetails(appointmentId);
    setShowEditDialog(true);
  };

  const handleFormSuccess = () => {
    setShowEditDialog(false);
    setSelectedAppointmentId(null);
    setStatusHistory([]);
    setReschedules([]);
    router.refresh();
  };

  const handleDepositSuccess = async () => {
    if (!selectedAppointmentId) {
      return;
    }

    await loadAppointmentDetails(selectedAppointmentId);
    router.refresh();
  };

  const handleCloseEditDialog = (open: boolean) => {
    setShowEditDialog(open);

    if (!open) {
      setSelectedAppointmentId(null);
      setStatusHistory([]);
      setReschedules([]);
    }
  };

  const handleSlotClick = (date: Date, startTime: string) => {
    if (!canCreate) {
      return;
    }

    setInitialDate(date);
    setInitialStartTime(startTime);
    setShowCreateDialog(true);
  };

  const handleCloseCreateDialog = (open: boolean) => {
    setShowCreateDialog(open);

    if (!open) {
      setInitialDate(undefined);
      setInitialStartTime("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointments</h1>
        {canCreate && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New appointment
          </Button>
        )}
      </div>

      <AppointmentsViewTabs
        lashists={lashists}
        selectedLashistId={selectedLashistId}
        onLashistChange={setSelectedLashistId}
        calendarAppointments={calendarAppointments}
        tableAppointments={tableAppointments}
        showCancelledNoShow={showCancelledNoShow}
        onShowCancelledNoShowChange={setShowCancelledNoShow}
        dateFilterPreset={dateFilterPreset}
        onDateFilterPresetChange={setDateFilterPreset}
        customDateRange={customDateRange}
        onCustomDateRangeChange={setCustomDateRange}
        onOpenAppointment={handleOpenAppointment}
        onSlotClick={handleSlotClick}
      />

      <AppointmentCreateDialog
        open={showCreateDialog}
        onOpenChange={handleCloseCreateDialog}
        clients={clients}
        lashists={lashists}
        services={services}
        paymentMethods={paymentMethods}
        canManageDeposit={canCreateDeposit}
        initialDate={initialDate}
        initialStartTime={initialStartTime}
        onSuccess={() => handleCloseCreateDialog(false)}
      />

      <AppointmentEditDialog
        open={showEditDialog}
        onOpenChange={handleCloseEditDialog}
        selectedAppointment={selectedAppointment}
        clients={clients}
        lashists={lashists}
        services={services}
        paymentMethods={paymentMethods}
        canCreateDeposit={canCreateDeposit}
        canVoidDeposit={canVoidDeposit}
        canCancel={canCancel}
        canNoShow={canNoShow}
        statusHistory={statusHistory}
        reschedules={reschedules}
        readOnly={
          !canUpdate ||
          selectedAppointment?.status === "cancelled" ||
          selectedAppointment?.status === "no_show"
        }
        onAppointmentSuccess={handleFormSuccess}
        onDepositSuccess={handleDepositSuccess}
      />
    </div>
  );
}
