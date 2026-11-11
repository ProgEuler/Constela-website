"use client";

import useSWR from "swr";
import { Users, Heart, CreditCard, DollarSign, Camera, TicketCheck } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import StatCard, { type Stat } from "@/components/shared/stat-card";
import { LineChartComp } from "@/components/charts/line-chart";
import { PieChartComp } from "@/components/charts/pie-chart";
import IconWrap from "@/components/common/icon-wrapper";
import { AreaChartComp } from "@/components/charts/area-chart";
import { BarChartComp } from "@/components/charts/bar-chart";
import { RealTimeActivity } from "./_components/real-time-activity";

type DashboardStats = {
  total_users: number;
  premium_users: number;
  pending_verifications: number;
  unresolved_reports: number;
  pending_tickets: number;
  total_revenue: number;
};

export default function SuperAdminDashboard() {
  const { data: statsData, isLoading } = useSWR<DashboardStats>("/api/admin/dashboard/stats/");

  const stats: Stat[] = [
    {
      label: "Total Users",
      value: statsData ? statsData.total_users.toLocaleString() : "—",
      change: "",
      icon: Users,
    },
    {
      label: "Premium Users",
      value: statsData ? statsData.premium_users.toLocaleString() : "—",
      change: "",
      icon: CreditCard,
    },
    {
      label: "Total Revenue",
      value: statsData ? `$${statsData.total_revenue.toLocaleString()}` : "—",
      change: "",
      icon: DollarSign,
    },
    {
      label: "Pending Verifications",
      value: statsData ? statsData.pending_verifications.toLocaleString() : "—",
      change: "",
      icon: Camera,
      iconColor: "warning",
    },
    {
      label: "Open Reports",
      value: statsData ? statsData.unresolved_reports.toLocaleString() : "—",
      change: "",
      icon: Heart,
      iconColor: "destructive",
    },
    {
      label: "Open Tickets",
      value: statsData ? statsData.pending_tickets.toLocaleString() : "—",
      change: "",
      icon: TicketCheck,
      iconColor: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <StatCard stats={stats} loading={isLoading} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LineChartComp />
          <PieChartComp />
          <AreaChartComp />
          <BarChartComp />
        </div>
        <RealTimeActivity />
      </div>
    </div>
  );
}
