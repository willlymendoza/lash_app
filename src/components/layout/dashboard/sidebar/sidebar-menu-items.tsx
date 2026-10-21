"use client";

import type { ComponentType } from "react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { PermissionKey } from "@/scripts/permission-catalog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarHeart,
  Box,
  ChartColumn,
  UserRoundCog,
  FlaskConical,
  ShoppingBag,
  Calculator,
  Receipt,
  Star,
  Shield,
  CreditCard,
  Tags,
  Scissors,
} from "lucide-react";

type SidebarNavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  requiredPermission?: PermissionKey;
};

type SidebarNavGroup = {
  groupName: string;
  items: SidebarNavItem[];
};

const navItems: SidebarNavGroup[] = [
  {
    groupName: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        requiredPermission: "dashboard.view",
      },
      {
        title: "Appointments",
        href: "/appointments",
        icon: CalendarHeart,
        requiredPermission: "appointments.read",
      },
      {
        title: "Clients",
        href: "/clients",
        icon: Users,
        requiredPermission: "clients.read",
      },
      {
        title: "Services",
        href: "/services",
        icon: Scissors,
        requiredPermission: "services.read",
      },
      {
        title: "Sales",
        href: "/sales",
        icon: ShoppingBag,
        requiredPermission: "sales.read",
      },
      {
        title: "Products",
        href: "/products",
        icon: Box,
        requiredPermission: "products.read",
      },
      {
        title: "Supplies",
        href: "/supplies",
        icon: FlaskConical,
        requiredPermission: "supplies.read",
      },
      {
        title: "POS",
        href: "/pos",
        icon: Calculator,
        requiredPermission: "pos.checkout",
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: Receipt,
        requiredPermission: "expenses.read",
      },
      {
        title: "Lash Artists",
        href: "/lashists",
        icon: Star,
        requiredPermission: "lashists.read",
      },
      {
        title: "Reports",
        href: "/reports",
        icon: ChartColumn,
        requiredPermission: "reports.view",
      },
    ],
  },
  {
    groupName: "Administration",
    items: [
      {
        title: "Users",
        href: "/users",
        icon: UserRoundCog,
        requiredPermission: "users.read",
      },
      {
        title: "Roles",
        href: "/roles",
        icon: Shield,
        requiredPermission: "roles.read",
      },
      {
        title: "Payment methods",
        href: "/payment-methods",
        icon: CreditCard,
        requiredPermission: "payment-methods.read",
      },
      {
        title: "Expense categories",
        href: "/expense-categories",
        icon: Tags,
        requiredPermission: "expense-categories.read",
      },
    ],
  },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

type SidebarMenuItemsProps = {
  allowedPermissions?: PermissionKey[];
  isAdmin?: boolean;
};

export function SidebarMenuItems({ allowedPermissions, isAdmin = false }: SidebarMenuItemsProps) {
  const pathname = usePathname();
  const allowedPermissionSet = new Set(allowedPermissions ?? []);

  const visibleNavGroups = navItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.requiredPermission || isAdmin) {
          return true;
        }

        return allowedPermissionSet.has(item.requiredPermission);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <SidebarContent className="bg-surface-0">
      {visibleNavGroups.map((group) => (
        <SidebarGroup key={group.groupName}>
          <SidebarGroupLabel className="text-ink-400 uppercase">{group.groupName}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActiveRoute(pathname, item.href)}
                  className="text-ink-500 text-sm hover:bg-brand-50 hover:text-brand-800 data-[active=true]:bg-brand-100 data-[active=true]:text-brand-700 font-medium py-5 px-4 active:bg-brand-100 active:text-brand-800"
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
