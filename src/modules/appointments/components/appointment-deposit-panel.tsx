"use client";

import { formatPrice } from "@/lib/utils/currency";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  formatFlexibleDateToGuatemalaDisplay,
  normalizeToGuatemalaISODateOnly,
} from "@/lib/utils/date";
import {
  PAYMENT_METHOD_DEPOSIT_REQUIREMENTS,
  type PaymentMethodCode,
} from "@/lib/utils/payment-method-conditions";
import { AppointmentDepositUpsertForm } from "./appointment-deposit-upsert-form";
import { AppointmentDepositVoidForm } from "./appointment-deposit-void-form";

type AppointmentDepositPanelProps = {
  appointment: {
    id: number;
    clientId: number;
    activeDeposit?: {
      id: number;
      amount: string;
      status: "recorded" | "applied" | "voided";
      paymentMethodId: number;
      referenceNumber: string | null;
      referenceDate: Date | string | null;
      bankName: string | null;
      accountHolderName: string | null;
      destinationAccountLastFour: string | null;
      referenceNote: string | null;
      paymentMethodNameSnapshot?: string | null;
    } | null;
  };
  paymentMethods: { id: number; code: string; name: string }[];
  canCreateDeposit: boolean;
  canVoidDeposit: boolean;
  readOnly: boolean;
  onSuccess?: () => void;
};

export function AppointmentDepositPanel({
  appointment,
  paymentMethods,
  canCreateDeposit,
  canVoidDeposit,
  readOnly,
  onSuccess,
}: AppointmentDepositPanelProps) {
  const selectedPaymentMethodCode =
    appointment.activeDeposit
      ? paymentMethods.find(
          (item) => item.id === appointment.activeDeposit?.paymentMethodId,
        )?.code
      : undefined;
  const methodRequirements =
    selectedPaymentMethodCode &&
    selectedPaymentMethodCode in PAYMENT_METHOD_DEPOSIT_REQUIREMENTS
      ? PAYMENT_METHOD_DEPOSIT_REQUIREMENTS[
          selectedPaymentMethodCode as PaymentMethodCode
        ]
      : null;
  const showReferenceNote = Boolean(
    methodRequirements?.required.includes("referenceNote") ||
      methodRequirements?.optional.includes("referenceNote"),
  );
  const showReferenceNumber = Boolean(
    methodRequirements?.required.includes("referenceNumber") ||
      methodRequirements?.optional.includes("referenceNumber"),
  );
  const showReferenceDate = Boolean(
    methodRequirements?.required.includes("referenceDate") ||
      methodRequirements?.optional.includes("referenceDate"),
  );
  const showBankName = Boolean(
    methodRequirements?.required.includes("bankName") ||
      methodRequirements?.optional.includes("bankName"),
  );
  const showAccountHolderName = Boolean(
    methodRequirements?.required.includes("accountHolderName") ||
      methodRequirements?.optional.includes("accountHolderName"),
  );
  const showDestinationAccountLastFour = Boolean(
    methodRequirements?.optional.includes("destinationAccountLastFour"),
  );

  const hasExistingDeposit = Boolean(appointment.activeDeposit);
  const canToggleCreateDeposit = canCreateDeposit && !readOnly;
  const canEditDeposit = canCreateDeposit && canVoidDeposit && !readOnly;
  const canOpenVoidDeposit = canVoidDeposit && !readOnly;
  const hasAnyDepositPermission = canCreateDeposit || canVoidDeposit;
  const [showCreateMode, setShowCreateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isVoidMode, setIsVoidMode] = useState(false);
  const depositStatusLabelMap: Record<
    NonNullable<AppointmentDepositPanelProps["appointment"]["activeDeposit"]>["status"],
    string
  > = {
    recorded: "Recorded",
    applied: "Applied",
    voided: "Voided",
  };

  const handleDepositActionSuccess = () => {
    setShowCreateMode(false);
    setIsEditMode(false);
    setIsVoidMode(false);
    onSuccess?.();
  };

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Deposit</h3>
        <p className="text-xs text-muted-foreground">
          Only one active deposit is allowed per appointment.
        </p>
      </div>

      {!hasExistingDeposit && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="hasDeposit">Add deposit</Label>
            <Switch
              id="hasDeposit"
              checked={showCreateMode}
              onCheckedChange={(checked) => {
                if (!canToggleCreateDeposit) {
                  return;
                }
                setShowCreateMode(checked);
              }}
              disabled={!canToggleCreateDeposit}
            />
          </div>
          {!canCreateDeposit && hasAnyDepositPermission && (
            <p className="text-xs text-amber-700">
              You do not have permission to record deposits.
            </p>
          )}
        </div>
      )}

      {hasExistingDeposit && !isEditMode && !isVoidMode && (
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Deposit status
              </span>
              <Badge variant="secondary">
                {appointment.activeDeposit
                  ? depositStatusLabelMap[appointment.activeDeposit.status]
                  : "Not available"}
              </Badge>
            </div>

            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div className="grid grid-cols-[140px_1fr] gap-3">
                <dt className="font-medium text-muted-foreground">
                  Amount
                </dt>
                <dd className="font-semibold text-foreground">
                  {formatPrice(appointment.activeDeposit?.amount ?? "0")}
                </dd>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-3">
                <dt className="font-medium text-muted-foreground">
                  Method
                </dt>
                <dd className="font-medium text-foreground">
                  {appointment.activeDeposit?.paymentMethodNameSnapshot ||
                    paymentMethods.find(
                      (item) => item.id === appointment.activeDeposit?.paymentMethodId,
                    )?.name ||
                    "Not available"}
                </dd>
              </div>
              {showReferenceNote && (
                <div className="grid grid-cols-[140px_1fr] gap-3">
                  <dt className="font-medium text-muted-foreground">
                    Reference note
                  </dt>
                  <dd className="text-foreground">
                    {appointment.activeDeposit?.referenceNote || "Sin nota"}
                  </dd>
                </div>
              )}
              {showReferenceNumber && (
                <div className="grid grid-cols-[140px_1fr] gap-3">
                  <dt className="font-medium text-muted-foreground">
                    Reference no.
                  </dt>
                  <dd className="text-foreground">
                    {appointment.activeDeposit?.referenceNumber || "Not applicable"}
                  </dd>
                </div>
              )}
              {showReferenceDate && (
                <div className="grid grid-cols-[140px_1fr] gap-3">
                  <dt className="font-medium text-muted-foreground">
                    Reference date
                  </dt>
                  <dd className="text-foreground">
                    {formatFlexibleDateToGuatemalaDisplay(
                      appointment.activeDeposit?.referenceDate,
                    )}
                  </dd>
                </div>
              )}
              {showBankName && (
                <div className="grid grid-cols-[140px_1fr] gap-3">
                  <dt className="font-medium text-muted-foreground">Bank</dt>
                  <dd className="text-foreground">
                    {appointment.activeDeposit?.bankName || "Not applicable"}
                  </dd>
                </div>
              )}
              {showAccountHolderName && (
                <div className="grid grid-cols-[140px_1fr] gap-3">
                  <dt className="font-medium text-muted-foreground">
                    Account holder
                  </dt>
                  <dd className="text-foreground">
                    {appointment.activeDeposit?.accountHolderName || "Not applicable"}
                  </dd>
                </div>
              )}
              {showDestinationAccountLastFour && (
                <div className="grid grid-cols-[140px_1fr] gap-3">
                  <dt className="font-medium text-muted-foreground">
                    Last 4 digits
                  </dt>
                  <dd className="text-foreground">
                    {appointment.activeDeposit?.destinationAccountLastFour || "Not applicable"}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEditDeposit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditMode(true);
                }}
              >
                Edit deposit
              </Button>
            )}
            {canOpenVoidDeposit && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setIsVoidMode(true);
                }}
              >
                Void deposit
              </Button>
            )}
          </div>
        </div>
      )}

      {(showCreateMode || isEditMode) && (
        <AppointmentDepositUpsertForm
          appointmentId={appointment.id}
          clientId={appointment.clientId}
          paymentMethods={paymentMethods}
          canCreateDeposit={canCreateDeposit}
          readOnly={readOnly}
          defaultAmount={appointment.activeDeposit?.amount}
          defaultPaymentMethodId={appointment.activeDeposit?.paymentMethodId}
          defaultReferenceNumber={appointment.activeDeposit?.referenceNumber}
          defaultReferenceDate={
            normalizeToGuatemalaISODateOnly(
              appointment.activeDeposit?.referenceDate,
            )
          }
          defaultBankName={appointment.activeDeposit?.bankName}
          defaultAccountHolderName={appointment.activeDeposit?.accountHolderName}
          defaultDestinationAccountLastFour={
            appointment.activeDeposit?.destinationAccountLastFour
          }
          defaultReferenceNote={appointment.activeDeposit?.referenceNote}
          hasExistingDeposit={hasExistingDeposit}
          onCancelEdit={() => {
            setIsEditMode(false);
            setShowCreateMode(false);
          }}
          onSuccess={handleDepositActionSuccess}
        />
      )}

      {isVoidMode && appointment.activeDeposit && (
        <AppointmentDepositVoidForm
          depositId={appointment.activeDeposit.id}
          canVoidDeposit={canVoidDeposit}
          readOnly={readOnly}
          onCancel={() => setIsVoidMode(false)}
          onSuccess={handleDepositActionSuccess}
        />
      )}
    </div>
  );
}
