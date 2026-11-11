"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { CircleAlert, DollarSign, RefreshCcw, CreditCard } from "lucide-react"
import { AgTable } from "@/components/shared/AgTable"
import StatCard, { type Stat } from "@/components/shared/stat-card"

type ApiPayment = {
  id: number
  user: {
    id: string
    username: string
    email: string
  }
  transaction_id: string
  amount: string
  plan_name: string
  date: string
  status: string
  payment_method: string
}

type PaymentsStats = {
  total_revenue: number
  pending_disputes: number
  refunds_issued: number
  total_payments: number
}

type PaymentsData = {
  stats: PaymentsStats
  payments: ApiPayment[]
}

export default function Page() {
  const { data, error, isLoading } = useSWR<PaymentsData>("/api/admin/payments/")
  const stats = data?.stats
  const payments = (data?.payments ?? []).map((p) => ({
          id: p.id,
          user: p.user.username,
          email: p.user.email,
          transactionId: p.transaction_id,
          amount: `$${p.amount}`,
          plan: p.plan_name,
          date: p.date,
          status: p.status,
          paymentMethod: p.payment_method || "Credit Card",
        }))

  useEffect(() => {
    if (error) toast.error(error.message ?? "Failed to load payments", { id: "payments-load" })
  }, [error])

  const statCards: Stat[] = [
    { label: "Total Payments", value: String(payments.length), change: "", icon: CreditCard },
    {
      label: "Monthly Revenue",
      value: `$${stats?.total_revenue?.toFixed(2) ?? "0.00"}`,
      change: "",
      icon: DollarSign,
      iconColor: "success",
    },
    {
      label: "Pending Disputes",
      value: String(stats?.pending_disputes ?? 0),
      change: "",
      icon: CircleAlert,
      iconColor: "warning",
    },
    {
      label: "Refunds issued",
      value: String(stats?.refunds_issued ?? 0),
      change: "",
      icon: RefreshCcw,
      iconColor: "destructive",
    },
  ]

  return (
    <div className="space-y-6">
      <StatCard stats={statCards} loading={isLoading} />

      <AgTable
        columnDefs={[
          {
            field: "user",
            headerName: "User",
            cellRenderer: "tableUserCellWithEmail",
            minWidth: 220,
          },
          { field: "transactionId", headerName: "Transaction ID", minWidth: 160 },
          { field: "amount", headerName: "Amount", maxWidth: 120 },
          { field: "plan", headerName: "Plan", minWidth: 140 },
          { field: "date", headerName: "Date" },
          { 
            field: "status", 
            headerName: "Status",
            cellRenderer: (params: { value: string }) => {
              const val = params.value?.toLowerCase() || ""
              let classes = "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-500"
              if (val.includes("success") || val.includes("paid")) {
                classes = "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-500"
              } else if (val.includes("disput") || val.includes("pend")) {
                classes = "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-500"
              } else if (val.includes("fail") || val.includes("refund")) {
                classes = "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-500"
              }
              return (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
                  {params.value}
                </span>
              )
            }
          },
          { field: "paymentMethod", headerName: "Payment Method" },
        ]}
        rowData={payments}
        loading={isLoading}
        pagination
        pageSize={20}
      />
    </div>
  )
}
