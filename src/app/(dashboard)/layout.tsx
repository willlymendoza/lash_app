import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard/dashboard-header";
import { SidebarShell } from "@/components/layout/dashboard/sidebar/sidebar-shell";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireSession } from "@/modules/auth/server/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <SidebarShell />
      <SidebarInset className="bg-surface-50">
        <DashboardHeader />
        <main className="w-full min-h-[calc(100svh-5rem)] px-4 py-6 md:px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
