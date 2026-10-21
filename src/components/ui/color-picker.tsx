"use client";

import * as React from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

type ColorPickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
};

export function ColorPicker({
  value = "#000000",
  onChange,
  disabled = false,
  label = "Color",
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="color-picker">{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="color-picker"
            disabled={disabled}
            className="w-full justify-start gap-2"
            type="button"
          >
            <div
              className="size-6 rounded border"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <HexColorPicker
              color={value}
              onChange={(color) => {
                onChange?.(color);
              }}
            />
            <Input
              type="text"
              value={value}
              onChange={(e) => {
                const hex = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                  onChange?.(hex);
                }
              }}
              disabled={disabled}
              placeholder="#000000"
              maxLength={7}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
