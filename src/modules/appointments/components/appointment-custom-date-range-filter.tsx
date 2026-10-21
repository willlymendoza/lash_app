"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type AppointmentCustomDateRangeFilterProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
};

export function AppointmentCustomDateRangeFilter({
  value,
  onChange,
}: AppointmentCustomDateRangeFilterProps) {
  const [month, setMonth] = useState<Date | undefined>(value?.from ?? value?.to);

  const label = useMemo(() => {
    if (value?.from && value?.to) {
      return `${format(value.from, "dd/MM/yyyy")} - ${format(value.to, "dd/MM/yyyy")}`;
    }

    if (value?.from) {
      return format(value.from, "dd/MM/yyyy");
    }

    if (value?.to) {
      return format(value.to, "dd/MM/yyyy");
    }

    return "Select range";
  }, [value]);

  return (
    <div className="space-y-2">
      <Label>Custom range</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value?.from && !value?.to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            month={month}
            onMonthChange={setMonth}
            autoFocus
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
