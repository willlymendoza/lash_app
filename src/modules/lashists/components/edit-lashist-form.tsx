"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  updateLashistProfileFromForm,
  type UpdateLashistProfileFormState,
} from "@/modules/lashists/server/actions";

const initialState: UpdateLashistProfileFormState = {
  status: "idle",
  message: null,
};

type EditLashistFormProps = {
  lashistId: number;
  defaultCommissionType: string;
  defaultCommissionValue: number;
  color?: string | null;
  onSuccess?: () => void;
};

export function EditLashistForm({
  lashistId,
  defaultCommissionType,
  defaultCommissionValue,
  color,
  onSuccess,
}: EditLashistFormProps) {
  const [state, action, isPending] = useActionState(
    updateLashistProfileFromForm,
    initialState,
  );
  const hasShownSuccess = useRef(false);
  const [selectedColor, setSelectedColor] = useState(color || "#3B82F6");

  useEffect(() => {
    if (
      state.status === "success" &&
      state.message &&
      !hasShownSuccess.current
    ) {
      hasShownSuccess.current = true;
      toast.success(state.message, {
        richColors: true,
        duration: 2000,
        closeButton: true,
      });
      if (onSuccess) {
        onSuccess();
      }
    }
    if (state.status === "idle") {
      hasShownSuccess.current = false;
    }
  }, [state.status, state.message, onSuccess]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={lashistId} />

      <div className="space-y-2">
        <Label htmlFor="defaultCommissionType">Commission type</Label>
        <Select
          name="defaultCommissionType"
          defaultValue={
            state.values?.defaultCommissionType || defaultCommissionType
          }
          required
        >
          <SelectTrigger className="border-ink-200">
            <SelectValue placeholder="Select commission type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percent">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>
        {state.fieldErrors?.defaultCommissionType && (
          <p className="text-sm text-red-500">
            {state.fieldErrors.defaultCommissionType[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultCommissionValue">Commission value</Label>
        <Input
          type="text"
          id="defaultCommissionValue"
          name="defaultCommissionValue"
          defaultValue={
            state.values?.defaultCommissionValue || defaultCommissionValue
          }
          className="border-ink-200"
        />
        {state.fieldErrors?.defaultCommissionValue && (
          <p className="text-sm text-red-500">
            {state.fieldErrors.defaultCommissionValue[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <ColorPicker
          label="Identification color"
          value={selectedColor}
          onChange={setSelectedColor}
        />
        <input type="hidden" name="color" value={selectedColor} />
        {state.fieldErrors?.color && (
          <p className="text-sm text-red-500">
            {state.fieldErrors.color[0]}
          </p>
        )}
      </div>

      {state.message && state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white cursor-pointer"
      >
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
