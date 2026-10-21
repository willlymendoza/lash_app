import type { Metadata } from "next";
import { requirePermission } from "@/modules/permissions/server/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  await requirePermission("dashboard.view");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Citas - Brand (rosa) */}
        <Card className="bg-surface-0 border-ink-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-400">
              Today's Appointments
            </CardTitle>
            <div className="rounded-full bg-brand-50 p-2">
              <Calendar className="h-4 w-4 text-brand-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ink-900">12</div>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
              3 pending
            </span>
          </CardContent>
        </Card>

        {/* Clientes - Violeta */}
        <Card className="bg-surface-0 border-ink-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-400">
              New Clients
            </CardTitle>
            <div className="rounded-full bg-violet-50 p-2">
              <Users className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ink-900">5</div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
              +2 this week
            </span>
          </CardContent>
        </Card>

        {/* Sales - Brand */}
        <Card className="bg-surface-0 border-ink-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-400">
              Today's Sales
            </CardTitle>
            <div className="rounded-full bg-brand-50 p-2">
              <DollarSign className="h-4 w-4 text-brand-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ink-900">$1,250</div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
              +15% vs yesterday
            </span>
          </CardContent>
        </Card>

        {/* Ingresos - Emerald tendencia positiva */}
        <Card className="bg-surface-0 border-ink-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-400">
              Monthly Income
            </CardTitle>
            <div className="rounded-full bg-emerald-50 p-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ink-900">$24,500</div>
            <p className="text-xs text-ink-400">Target: $30,000</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
