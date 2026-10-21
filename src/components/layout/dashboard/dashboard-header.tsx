"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { dashboardRouteTitleBySegment } from "@/lib/constants/dashboard-route-titles";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Search,
} from "lucide-react";
import { usePathname } from "next/navigation";

function getPageTitle(pathname: string): string {
  if (pathname === "/") {
    return "Dashboard";
  }

  const [firstSegment] = pathname.split("/").filter(Boolean);
  return dashboardRouteTitleBySegment[firstSegment] ?? "Dashboard";
}

export function DashboardHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200 bg-surface-50/20 backdrop-blur-sm">
      <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="text-ink-500 hover:text-ink-900" />
          <Separator
            orientation="vertical"
            className="hidden h-5 bg-ink-200 sm:block self-center!"
          />
          <nav className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-ink-400">Home</span>
            <ChevronRight className="size-4 text-ink-300" />
            <span className="font-semibold text-ink-700">{pageTitle}</span>
          </nav>
        </div>

        <div className="relative hidden w-full max-w-96 lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            type="search"
            placeholder="Search clients, appointments..."
            className="h-10 rounded-xl border-surface-300 bg-surface-100 pr-14 pl-9 text-sm placeholder:text-ink-400 focus-visible:border-brand-300 focus-visible:ring-brand-200/50"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative text-ink-500 hover:bg-surface-100 hover:text-ink-900"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-500" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-ink-500 hover:bg-surface-100 hover:text-ink-900"
            aria-label="Create new"
          >
            <CirclePlus className="size-4" />
          </Button>
          <Separator orientation="vertical" className="h-5 bg-ink-200 self-center!" />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-surface-100"
            aria-label="User profile"
          >
            <Avatar className="size-10">
              <AvatarFallback className="bg-brand-100 text-brand-700">
                U
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight xl:block">
              <p className="text-sm font-semibold text-ink-700">User</p>
              <p className="text-xs text-ink-400">Account</p>
            </div>
            <ChevronDown className="hidden size-4 text-ink-400 xl:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
