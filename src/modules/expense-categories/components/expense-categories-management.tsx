"use client";

import { useState } from "react";

import { ExpenseCategoriesHeader } from "@/modules/expense-categories/components/expense-categories-header";
import { EditExpenseCategoryDialog } from "@/modules/expense-categories/components/edit-expense-category-dialog";
import { ExpenseCategoriesTable } from "@/modules/expense-categories/components/expense-categories-table";
import { usePathname } from "next/navigation";

type ExpenseCategoriesManagementProps = {
  expenseCategories: Array<{
    id: number;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  permissions: Record<string, boolean>;
};

export function ExpenseCategoriesManagement({
  expenseCategories,
  permissions,
}: ExpenseCategoriesManagementProps) {
  const canCreate = permissions["expense-categories.create"] ?? false;
  const pathname = usePathname();
  const [showDeleted, setShowDeleted] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    name: string;
    description: string | null;
  } | null>(null);

  const filteredCategories = expenseCategories.filter((category) => {
    if (showDeleted && category.deletedAt !== null) return true;
    if (!showDeleted && category.deletedAt !== null) return false;
    if (showInactive && !category.isActive) return true;
    if (!showInactive && !category.isActive) return false;
    return true;
  });

  const handleEdit = (categoryId: number, category: any) => {
    setEditingCategory({
      id: categoryId,
      name: category.name,
      description: category.description,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4" key={pathname}>
      <ExpenseCategoriesHeader
        showDeleted={showDeleted}
        showInactive={showInactive}
        onShowDeletedChange={setShowDeleted}
        onShowInactiveChange={setShowInactive}
        canCreate={canCreate}
        isCreateDialogOpen={isCreateDialogOpen}
        onCreateDialogOpenChange={setIsCreateDialogOpen}
      />

      <ExpenseCategoriesTable
        expenseCategories={filteredCategories}
        showDeleted={showDeleted}
        showInactive={showInactive}
        permissions={permissions}
        onEdit={handleEdit}
      />

      {editingCategory && (
        <EditExpenseCategoryDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          expenseCategoryId={editingCategory.id}
          initialData={editingCategory}
        />
      )}
    </div>
  );
}
