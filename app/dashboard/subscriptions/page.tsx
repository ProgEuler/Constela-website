"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Crown, DollarSign } from "lucide-react"
import { AgTable } from "@/components/shared/AgTable"
import StatCard from "@/components/shared/stat-card"
import { api } from "@/lib/api"

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
  const [stats, setStats] = useState<SubscriptionsStats | null>(null)
  const [subs, setSubs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.get<SubscriptionsData>("/api/admin/subscriptions/")
      setStats(data.stats)
      setSubs(
        data.subscriptions.map((s) => ({
          id: s.id,
          name: s.user.username,
          email: s.user.email,
          plan: s.plan_name,
          startDate: s.start_date,
          endDate: s.end_date,
          amount: `$${s.amount}`,
          status: s.status,
        }))
      )
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load subscriptions")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const statCards = [
    { label: "Active Subscriptions", value: String(stats?.active_subscriptions ?? 0), change: "", icon: Crown },
    { label: "Premium Plan", value: String(stats?.premium_plan_count ?? 0), change: "", icon: Crown },
    { label: "Basic Plan", value: String(stats?.basic_plan_count ?? 0), change: "", icon: Crown },
    { label: "Monthly Revenue", value: `$${stats?.monthly_revenue?.toFixed(2) ?? "0.00"}`, change: "", icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      <StatCard stats={statCards} />

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
        rowData={isLoading ? [] : subs}
      />
    </div>
  )
}
