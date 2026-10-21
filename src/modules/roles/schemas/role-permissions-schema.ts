import { z } from "zod";

export const updateRolePermissionsSchema = z.object({
  roleId: z.number().int().positive(),
  permissionIds: z.array(z.number().int().positive()),
});

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
