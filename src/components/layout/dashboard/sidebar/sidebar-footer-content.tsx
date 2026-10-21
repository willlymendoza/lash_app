"use client";

import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import { logout } from "@/modules/auth/server/actions";

export function SidebarFooterContent() {
  return (
    <SidebarFooter className="bg-surface-0">
      <SidebarMenu>
        <SidebarMenuItem className="text-brand-500">
          <form action={logout}>
            <SidebarMenuButton
              type="submit"
              className="text-brand-500 text-sm hover:bg-brand-50 hover:text-brand-500 active:bg-brand-100 active:text-brand-500 cursor-pointer"
            >
              <LogOutIcon />
              <span>Sign out</span>
            </SidebarMenuButton>
          </form>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
