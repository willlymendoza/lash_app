"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils/currency";
import { formatDuration } from "@/lib/utils/time";
import { ServiceActionsDropdown } from "@/modules/services/components/service-actions-dropdown";

type ServiceRow = {
  id: number;
  name: string;
  description: string | null;
  basePrice: string;
  estimatedDurationMinutes: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type ServicesTableProps = {
  services: ServiceRow[];
  showDeleted: boolean;
  showInactive: boolean;
  permissions: Record<string, boolean>;
  onEdit: (serviceId: number, service: ServiceRow) => void;
};

export function ServicesTable({
  services,
  showDeleted,
  showInactive,
  permissions,
  onEdit,
}: ServicesTableProps) {
  const canUpdate = permissions["services.update"] ?? false;
  const canRemove = permissions["services.remove"] ?? false;
  const canRestore = permissions["services.restore"] ?? false;
  const canToggleActive = permissions["services.toggle-active"] ?? false;
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-ink-200 rounded-lg bg-surface-0">
        <p className="text-ink-500 text-sm">
          {showDeleted
            ? "No deleted services"
            : showInactive
              ? "No inactive services"
              : "No services registered"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-50 border-b-ink-200 hover:bg-surface-50">
            <TableHead className="text-ink-700 font-semibold">Name</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Description
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Base price
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Estimated duration
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Active status
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">Status</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => {
            const isDeleted = service.deletedAt !== null;
            const isInactive = !service.isActive;

            return (
              <TableRow
                key={service.id}
                className="border-b-ink-200 hover:bg-surface-50 transition-colors"
              >
                <TableCell className="font-medium text-ink-900">
                  {service.name}
                </TableCell>
                <TableCell className="text-ink-700">
                  {service.description ? (
                    <span
                      className="line-clamp-2"
                      title={service.description}
                    >
                      {service.description.length > 40
                        ? `${service.description.slice(0, 39)}…`
                        : service.description}
                    </span>
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-ink-700">
                  {formatPrice(service.basePrice)}
                </TableCell>
                <TableCell className="text-ink-700">
                  {formatDuration(service.estimatedDurationMinutes)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isInactive ? "outline" : "secondary"}
                    className={
                      isInactive
                        ? "border-ink-200 text-ink-500"
                        : "bg-emerald-50 text-emerald-600 border-emerald-50"
                    }
                  >
                    {isInactive ? "Inactive" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isDeleted ? "outline" : "secondary"}
                    className={
                      isDeleted
                        ? "border-ink-200 text-ink-500"
                        : "bg-emerald-50 text-emerald-600 border-emerald-50"
                    }
                  >
                    {isDeleted ? "Deleted" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ServiceActionsDropdown
                    serviceId={service.id}
                    serviceName={service.name}
                    isDeleted={isDeleted}
                    isActive={service.isActive}
                    canUpdate={canUpdate}
                    canRemove={canRemove}
                    canRestore={canRestore}
                    canToggleActive={canToggleActive}
                    onEdit={() => onEdit(service.id, service)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
