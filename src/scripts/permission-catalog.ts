export type PermissionKey = string;

export interface Permission {
  key: PermissionKey;
  module: string;
  name: string;
  description: string;
}

export const permissionCatalog: Permission[] = [
  { key: "dashboard.view", module: "dashboard", name: "View", description: "View dashboard information and statistics" },

  { key: "appointments.read", module: "Appointments", name: "View", description: "View appointment list and details" },
  { key: "appointments.create", module: "Appointments", name: "Create", description: "Create new appointments" },
  { key: "appointments.update", module: "Appointments", name: "Edit", description: "Update existing appointments" },
  { key: "appointments.cancel", module: "Appointments", name: "Cancel", description: "Cancel scheduled appointments" },
  { key: "appointments.no-show", module: "Appointments", name: "Marcar ausente", description: "Mark appointments as client no-shows" },
  { key: "appointments.complete", module: "Appointments", name: "Checkout", description: "Check out appointment at the register" },

  { key: "appointment-advances.read", module: "Appointment deposits", name: "View", description: "View appointment deposit list and details" },
  { key: "appointment-advances.create", module: "Appointment deposits", name: "Create", description: "Create new appointment deposits" },
  { key: "appointment-advances.resolve", module: "Appointment deposits", name: "Resolve", description: "Resolve appointment deposits (apply, refund, etc.)" },
  { key: "appointment-advances.void", module: "Appointment deposits", name: "Edit/Void", description: "Edit/Void recorded deposits" },

  { key: "clients.read", module: "Clients", name: "View", description: "View client list and details" },
  { key: "clients.create", module: "Clients", name: "Create", description: "Create new clients" },
  { key: "clients.update", module: "Clients", name: "Edit", description: "Update existing clients" },
  { key: "clients.remove", module: "Clients", name: "Delete", description: "Delete clients" },
  { key: "clients.restore", module: "Clients", name: "Restore", description: "Restore deleted clients" },

  { key: "clients.add-note", module: "Clients", name: "Add Note", description: "Add client notes" },
  { key: "clients.edit-note", module: "Clients", name: "Edit Note", description: "Edit client notes" },
  { key: "clients.delete-note", module: "Clients", name: "Delete Note", description: "Delete client notes" },
  { key: "clients.restore-note", module: "Clients", name: "Restore Note", description: "Restore client notes" },

  { key: "services.read", module: "Services", name: "View", description: "View service list and details" },
  { key: "services.create", module: "Services", name: "Create", description: "Create new services" },
  { key: "services.update", module: "Services", name: "Edit", description: "Update existing services" },
  { key: "services.remove", module: "Services", name: "Delete", description: "Delete services" },
  { key: "services.restore", module: "Services", name: "Restore", description: "Restore deleted services" },
  { key: "services.toggle-active", module: "Services", name: "Activate/Deactivate", description: "Activate or deactivate services" },

  { key: "sales.read", module: "Sales", name: "View", description: "View sales list and details" },
  { key: "sales.create", module: "Sales", name: "Create", description: "Create new sales" },
  { key: "sales.void", module: "Sales", name: "Void", description: "Void recorded sales" },

  { key: "pos.checkout", module: "POS", name: "Procesar pago", description: "Process payments at the point of sale" },

  { key: "products.read", module: "Products", name: "View", description: "View product list and details" },
  { key: "products.create", module: "Products", name: "Create", description: "Create new products" },
  { key: "products.update", module: "Products", name: "Edit", description: "Update existing products" },
  { key: "products.remove", module: "Products", name: "Delete", description: "Delete products" },
  { key: "products.restore", module: "Products", name: "Restore", description: "Restore deleted products" },

  { key: "supplies.read", module: "Supplies", name: "View", description: "View supply list and details" },
  { key: "supplies.create", module: "Supplies", name: "Create", description: "Create new supplies" },
  { key: "supplies.update", module: "Supplies", name: "Edit", description: "Update existing supplies" },
  { key: "supplies.remove", module: "Supplies", name: "Delete", description: "Delete supplies" },
  { key: "supplies.restore", module: "Supplies", name: "Restore", description: "Restore deleted supplies" },

  { key: "inventory.read", module: "Inventory", name: "View", description: "View inventory levels" },
  { key: "inventory.adjust", module: "Inventory", name: "Adjust", description: "Adjust inventory levels" },

  { key: "expenses.read", module: "Expenses", name: "View", description: "View expense list and details" },
  { key: "expenses.create", module: "Expenses", name: "Create", description: "Create new expenses" },
  { key: "expenses.void", module: "Expenses", name: "Void", description: "Void recorded expenses" },

  { key: "reports.view", module: "Reports", name: "View", description: "View reports" },
  { key: "reports.export", module: "Reports", name: "Export", description: "Export reports to files" },

  { key: "lashists.read", module: "Lash Artists", name: "View", description: "View lash artist list and details" },
  { key: "lashists.update", module: "Lash Artists", name: "Edit", description: "Update lash artist information" },

  { key: "lashist-advances.read", module: "Lash Artist Advances", name: "View", description: "View lash artist advances" },
  { key: "lashist-advances.create", module: "Lash Artist Advances", name: "Create", description: "Create advances for lash artists" },
  { key: "lashist-advances.void", module: "Lash Artist Advances", name: "Void", description: "Void recorded advances" },

  { key: "lashist-payouts.read", module: "Lash Artist Payouts", name: "View", description: "View lash artist payouts" },
  { key: "lashist-payouts.create", module: "Lash Artist Payouts", name: "Create", description: "Create new payouts" },
  { key: "lashist-payouts.post", module: "Lash Artist Payouts", name: "Record", description: "Record lash artist payouts" },
  { key: "lashist-payouts.void", module: "Lash Artist Payouts", name: "Void", description: "Void recorded payouts" },

  { key: "users.read", module: "Users", name: "View", description: "View user list and details" },
  { key: "users.create", module: "Users", name: "Create", description: "Create new users" },
  { key: "users.update", module: "Users", name: "Edit", description: "Update existing users" },
  { key: "users.reset-password", module: "Users", name: "Reset password", description: "Reset user passwords" },
  { key: "users.toggle-active", module: "Users", name: "Activate/Deactivate", description: "Activate or deactivate users" },
  { key: "users.assign-lashist", module: "Users", name: "Assign Lash Artist", description: "Assign a user as a lash artist" },

  { key: "roles.read", module: "Roles", name: "View", description: "View role list and details" },
  { key: "roles.create", module: "Roles", name: "Create", description: "Create new roles" },
  { key: "roles.update", module: "Roles", name: "Edit", description: "Update existing roles" },
  { key: "roles.assign", module: "Roles", name: "Assign", description: "Assign roles to users" },
  { key: "roles.toggle-active", module: "Roles", name: "Activate/Deactivate", description: "Activate or deactivate roles" },

  { key: "permissions.assign", module: "Permissions", name: "Assign", description: "Assign permissions to roles" },
  { key: "permissions.toggle-active", module: "Permissions", name: "Activate/Deactivate", description: "Activate or deactivate permissions" },
  { key: "permissions.remove", module: "Permissions", name: "Remove", description: "Remove permissions from roles" },

  { key: "payment-methods.read", module: "Payment Methods", name: "View", description: "View payment methods" },
  { key: "payment-methods.update", module: "Payment Methods", name: "Edit", description: "Update payment methods" },
  { key: "payment-methods.toggle-active", module: "Payment Methods", name: "Activate/Deactivate", description: "Activate or deactivate payment methods" },

  { key: "expense-categories.read", module: "Expense Categories", name: "View", description: "View expense categories" },
  { key: "expense-categories.create", module: "Expense Categories", name: "Create", description: "Create expense categories" },
  { key: "expense-categories.update", module: "Expense Categories", name: "Edit", description: "Update expense categories" },
  { key: "expense-categories.remove", module: "Expense Categories", name: "Delete", description: "Delete expense categories" },
  { key: "expense-categories.restore", module: "Expense Categories", name: "Restore", description: "Restore deleted expense categories" },
  { key: "expense-categories.toggle-active", module: "Expense Categories", name: "Activate/Deactivate", description: "Activate or deactivate expense categories" },
] as const;

