"use client";

import { useState } from "react";

import { ServicesHeader } from "@/modules/services/components/services-header";
import { EditServiceDialog } from "@/modules/services/components/edit-service-dialog";
import { ServicesTable } from "@/modules/services/components/services-table";
import { usePathname } from "next/navigation";

type ServicesManagementProps = {
  services: Array<{
    id: number;
    name: string;
    description: string | null;
    basePrice: string;
    estimatedDurationMinutes: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  permissions: Record<string, boolean>;
};

export function ServicesManagement({
  services,
  permissions,
}: ServicesManagementProps) {
  const canCreate = permissions["services.create"] ?? false;
  const pathname = usePathname();
  const [showDeleted, setShowDeleted] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<{
    id: number;
    name: string;
    description: string | null;
    basePrice: string;
    estimatedDurationMinutes: number | null;
  } | null>(null);

  const filteredServices = services.filter((service) => {
    if (showDeleted && service.deletedAt !== null) return true;
    if (!showDeleted && service.deletedAt !== null) return false;
    if (showInactive && !service.isActive) return true;
    if (!showInactive && !service.isActive) return false;
    return true;
  });

  const handleEdit = (serviceId: number, service: any) => {
    setEditingService({
      id: serviceId,
      name: service.name,
      description: service.description,
      basePrice: service.basePrice,
      estimatedDurationMinutes: service.estimatedDurationMinutes,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4" key={pathname}>
      <ServicesHeader
        showDeleted={showDeleted}
        showInactive={showInactive}
        onShowDeletedChange={setShowDeleted}
        onShowInactiveChange={setShowInactive}
        canCreate={canCreate}
        isCreateDialogOpen={isCreateDialogOpen}
        onCreateDialogOpenChange={setIsCreateDialogOpen}
      />

      <ServicesTable
        services={filteredServices}
        showDeleted={showDeleted}
        showInactive={showInactive}
        permissions={permissions}
        onEdit={handleEdit}
      />

      {editingService && (
        <EditServiceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          serviceId={editingService.id}
          initialData={editingService}
        />
      )}
    </div>
  );
}
