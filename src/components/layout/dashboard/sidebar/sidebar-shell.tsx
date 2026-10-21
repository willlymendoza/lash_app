import { appConfig } from "@/lib/app-config";
import {
  Sidebar,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SidebarMenuItems } from "@/components/layout/dashboard/sidebar/sidebar-menu-items";
import { SidebarFooterContent } from "@/components/layout/dashboard/sidebar/sidebar-footer-content";
import { getCurrentActiveUser } from "@/modules/auth/server/queries/get-current-active-user";
import { getEffectivePermissions, isAdminUser } from "@/modules/permissions/server/queries";
import { Sparkles } from "lucide-react";

export async function SidebarShell() {
  const currentUser = await getCurrentActiveUser();
  const allowedPermissions = await getEffectivePermissions();
  const isAdmin = currentUser ? await isAdminUser(currentUser.id) : false;

  return (
    <Sidebar>
      <SidebarHeader className="h-20 justify-center bg-surface-0 px-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Sparkles className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="font-playfair text-[1.65rem] font-semibold text-ink-900">
              {appConfig.name}
            </p>
            <p className="text-xs tracking-[0.22em] text-ink-400 uppercase">
              Pro Dashboard
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarMenuItems allowedPermissions={allowedPermissions} isAdmin={isAdmin} />
      <SidebarSeparator className="mx-0" />
      <SidebarFooterContent />
    </Sidebar>
  );
}
