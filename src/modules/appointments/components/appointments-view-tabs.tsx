"use client";

import type { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type DateFilterPreset } from "@/lib/utils/date";
import { AppointmentCalendar } from "./appointment-calendar";
import { AppointmentCustomDateRangeFilter } from "./appointment-custom-date-range-filter";
import { LashistFilter } from "./lashist-filter";
import { AppointmentsTable } from "./appointments-table";
import type { AppointmentLashistOption, AppointmentListItem } from "../types";

type AppointmentsViewTabsProps = {
  lashists: AppointmentLashistOption[];
  selectedLashistId: number | null;
  onLashistChange: (lashistId: number | null) => void;
  calendarAppointments: AppointmentListItem[];
  tableAppointments: AppointmentListItem[];
  showCancelledNoShow: boolean;
  onShowCancelledNoShowChange: (showCancelledNoShow: boolean) => void;
  dateFilterPreset: DateFilterPreset;
  onDateFilterPresetChange: (preset: DateFilterPreset) => void;
  customDateRange: DateRange | undefined;
  onCustomDateRangeChange: (range: DateRange | undefined) => void;
  onOpenAppointment: (appointmentId: number) => void;
  onSlotClick: (date: Date, startTime: string) => void;
};

export function AppointmentsViewTabs({
  lashists,
  selectedLashistId,
  onLashistChange,
  calendarAppointments,
  tableAppointments,
  showCancelledNoShow,
  onShowCancelledNoShowChange,
  dateFilterPreset,
  onDateFilterPresetChange,
  customDateRange,
  onCustomDateRangeChange,
  onOpenAppointment,
  onSlotClick,
}: AppointmentsViewTabsProps) {
  return (
    <Tabs defaultValue="calendar" className="w-full">
      <TabsList>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
      </TabsList>

      <TabsContent value="calendar" className="space-y-4">
        <div className="flex items-center gap-4">
          <LashistFilter
            lashists={lashists}
            selectedLashistId={selectedLashistId}
            onLashistChange={onLashistChange}
          />
        </div>

        <AppointmentCalendar
          appointments={calendarAppointments}
          lashistFilter={selectedLashistId}
          onEventClick={onOpenAppointment}
          onSlotClick={onSlotClick}
        />
      </TabsContent>

      <TabsContent value="list">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <LashistFilter
              lashists={lashists}
              selectedLashistId={selectedLashistId}
              onLashistChange={onLashistChange}
            />

            <div className="space-y-2">
              <Label htmlFor="date-filter">Filter by date</Label>
              <Select
                value={dateFilterPreset}
                onValueChange={(value) =>
                  onDateFilterPresetChange(value as DateFilterPreset)
                }
              >
                <SelectTrigger id="date-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateFilterPreset === "custom" && (
            <AppointmentCustomDateRangeFilter
              value={customDateRange}
              onChange={onCustomDateRangeChange}
            />
          )}

          <div className="flex items-center gap-2">
            <Switch
              id="show-cancelled-no-show"
              checked={showCancelledNoShow}
              onCheckedChange={onShowCancelledNoShowChange}
            />
            <Label htmlFor="show-cancelled-no-show">
              Show cancelled and no-show appointments
            </Label>
          </div>

          <AppointmentsTable
            appointments={tableAppointments}
            onOpenAppointment={onOpenAppointment}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
