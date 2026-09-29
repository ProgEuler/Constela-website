"use client";

import useSWR from "swr";
import { Users, Heart, CreditCard, DollarSign, Camera, TicketCheck, CircleAlert, MessageCircle } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import StatCard, { type Stat } from "@/components/shared/stat-card";
import { LegendAreaChart } from "@/components/charts/legend-area-chart";
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart";
import { AgTable } from "@/components/shared/AgTable";

type DashboardStats = {
  total_users: number;
  premium_users: number;
  pending_verifications: number;
  unresolved_reports: number;
  pending_tickets: number;
  total_revenue: number;
};

type UserProfile = {
  id: string;
  username: string;
  user: { email: string; date_joined?: string };
  subscription_tier: string;
};

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useSWR<DashboardStats>(
    "/api/admin/dashboard/stats/"
  );
  const { data: users, isLoading: usersLoading } = useSWR<UserProfile[]>(
    "/api/admin/users/"
  );
  const recentUsers = [...(users ?? [])]
    .sort(
      (a, b) =>
        new Date(b.user?.date_joined ?? 0).getTime() -
        new Date(a.user?.date_joined ?? 0).getTime()
    )
    .slice(0, 20);

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
      label: "Pending Reports",
      value: statsData ? statsData.unresolved_reports.toLocaleString() : "—",
      change: "",
      icon: CircleAlert,
      iconColor: "warning",
    },
    {
      label: "Open Tickets",
      value: statsData ? statsData.pending_tickets.toLocaleString() : "—",
      change: "",
      icon: TicketCheck,
      iconColor: "warning",
    },
  ];

  const rowData = recentUsers.map((u) => ({
    name: u.username,
    email: u.user?.email ?? "",
    joined: u.user?.date_joined
      ? new Date(u.user.date_joined).toLocaleDateString()
      : "—",
    status: u.subscription_tier === "freemium" ? "Free" : "Premium",
  }));

  return (
    <div className="space-y-6">
      <StatCard stats={stats} loading={statsLoading} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <LegendAreaChart />
        <HorizontalBarChart />
      </div>

      <AgTable
        title="Recent Users"
        columnDefs={[
          { field: "name", headerName: "Name", cellClass: "font-medium" },
          { field: "email", headerName: "Email" },
          { field: "joined", headerName: "Joined Date" },
          { field: "status", headerName: "Status" },
        ]}
        rowData={rowData}
        loading={usersLoading}
      />
    </div>
  );
}
