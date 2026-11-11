"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Crown, DollarSign } from "lucide-react"
import { AgTable } from "@/components/shared/AgTable"
import StatCard from "@/components/shared/stat-card"
import { TierLimitsPanel } from "./_components/tier-limits-panel"

type ApiSubscription = {
  id: number
  user: {
    id: string
    username: string
    email: string
  }
  plan_name: string
  start_date: string
  end_date: string
  amount: string
  status: string
}

type SubscriptionsStats = {
  active_subscriptions: number
  premium_plan_count: number
  basic_plan_count: number
  monthly_revenue: number
}

type SubscriptionsData = {
  stats: SubscriptionsStats
  subscriptions: ApiSubscription[]
}

export default function Page() {
  const { data, error, isLoading } = useSWR<SubscriptionsData>("/api/admin/subscriptions/")
  const stats = data?.stats
  const subs = (data?.subscriptions ?? []).map((s) => ({
          id: s.id,
          name: s.user.username,
          email: s.user.email,
          plan: s.plan_name,
          startDate: s.start_date,
          endDate: s.end_date,
          amount: `$${s.amount}`,
          status: s.status,
        }))

  useEffect(() => {
    if (error) toast.error(error.message ?? "Failed to load subscriptions", { id: "subscriptions-load" })
  }, [error])

  const statCards = [
    { label: "Active Subscriptions", value: String(stats?.active_subscriptions ?? 0), change: "", icon: Crown },
    { label: "Premium Plus", value: String(stats?.premium_plan_count ?? 0), change: "", icon: Crown },
    { label: "Premium Light", value: String(stats?.basic_plan_count ?? 0), change: "", icon: Crown },
    { label: "Revenue (Last 30 Days)", value: `$${stats?.monthly_revenue?.toFixed(2) ?? "0.00"}`, change: "", icon: DollarSign },
  ]

  return (
    <div className="space-y-8">
      <StatCard stats={statCards} loading={isLoading} />

      <TierLimitsPanel />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Active & Historical Subscribers</h2>
        <AgTable
        columnDefs={[
          { field: "id", headerName: "ID", maxWidth: 100 },
          {
            field: "name",
            headerName: "User",
            cellRenderer: "tableUserCellWithEmail",
            minWidth: 220,
          },
          { field: "plan", headerName: "Plan", minWidth: 140 },
          { field: "startDate", headerName: "Start Date" },
          { field: "endDate", headerName: "End Date" },
          { field: "amount", headerName: "Amount", maxWidth: 120 },
          { 
            field: "status", 
            headerName: "Status",
            maxWidth: 140,
            cellRenderer: (params: { value: string }) => (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                params.value === "Active" 
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-500"
                  : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-500"
              }`}>
                {params.value}
              </span>
            )
          },
        ]}
        rowData={subs}
        loading={isLoading}
        pagination
        pageSize={20}
      />
      </div>
    </div>
  )
}
