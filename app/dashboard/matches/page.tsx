"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Heart, TrendingUp } from "lucide-react"
import { AgTable } from "@/components/shared/AgTable"
import StatCard, { type Stat } from "@/components/shared/stat-card"
import { api } from "@/lib/api"

type ApiMatch = {
  id: number
  user1: { id: string; username: string; email: string; photo?: string }
  user2: { id: string; username: string; email: string; photo?: string }
  date: string
  messages_count: number
  compatibility_pct: number
}

type MatchesStats = {
  total_matches: number
  active_matches: number
  matches_today: number
  avg_messages_per_match: number
}

type MatchesData = {
  stats: MatchesStats
  matches: ApiMatch[]
}

export default function Page() {
  const [stats, setStats] = useState<MatchesStats | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.get<MatchesData>("/api/admin/matches/")
      setStats(data.stats)
      setMatches(
        data.matches.map((m) => ({
          matchId: m.id,
          participants: `${m.user1.username} & ${m.user2.username}`,
          messages: m.messages_count,
          date: m.date,
          status: m.messages_count > 0 ? "Active" : "New",
          compatibility: `${m.compatibility_pct}%`,
        }))
      )
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load matches")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const statCards: Stat[] = [
    { label: "Total Matches", value: String(stats?.total_matches ?? 0), change: "", icon: Heart },
    { label: "Active Matches", value: String(stats?.active_matches ?? 0), change: "", icon: Heart },
    { label: "Matches Today", value: String(stats?.matches_today ?? 0), change: "", icon: Heart },
    { label: "Avg Message/Match", value: String(stats?.avg_messages_per_match ?? 0), change: "", icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <StatCard stats={statCards} />

      <AgTable
        columnDefs={[
          { headerName: "Match ID", field: "matchId", maxWidth: 120 },
          {
            headerName: "Participants",
            field: "participants",
            cellRenderer: "tableUserCell",
            minWidth: 220,
          },
          { headerName: "Messages", field: "messages", maxWidth: 120 },
          { headerName: "Compatibility", field: "compatibility", maxWidth: 140 },
          { headerName: "Date", field: "date" },
          { 
            headerName: "Status", 
            field: "status",
            cellRenderer: (params: { value: string }) => (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                params.value === "Active" 
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-500"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-500"
              }`}>
                {params.value}
              </span>
            )
          },
        ]}
        rowData={isLoading ? [] : matches}
      />
    </div>
  )
}
