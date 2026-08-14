"use client";

import { useEffect, useState, useCallback } from "react"
import { AgTable } from "@/components/shared/AgTable"
import StatCard, { type Stat } from "@/components/shared/stat-card"
import { Card } from "@/components/ui/card"
import { CheckCircle, Eye, Flag, UserMinus } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Page() {
  const [statsData, setStatsData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moderators, setModerators] = useState<any[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, reportsRes, accountsRes] = await Promise.all([
        api.get<any>("/api/admin/moderation/stats/"),
        api.get<any[]>("/api/admin/reports/"),
        api.get<any[]>("/api/admin/accounts/")
      ]);
      setStatsData(statsRes);
      setReports(reportsRes);
      setModerators(accountsRes.filter((a: any) => ["support", "moderator", "admin", "superadmin"].includes(a.role)));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load moderation data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateReport = async (reportId: string, payload: any) => {
    try {
      await api.patch(`/api/admin/reports/${reportId}/`, payload);
      toast.success("Report updated successfully");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update report");
    }
  }

  const stats: Stat[] = [
    { label: "Reports Received", value: statsData?.global_stats?.reports_received?.toString() ?? "0", icon: Flag },
    { label: "Reports in Review", value: statsData?.global_stats?.reports_in_review?.toString() ?? "0", icon: Eye, iconColor: "warning" },
    { label: "Actions Taken", value: statsData?.global_stats?.actions_taken?.toString() ?? "0", icon: CheckCircle, iconColor: "success" },
    { label: "Suspended Users", value: statsData?.global_stats?.suspended_users?.toString() ?? "0", icon: UserMinus, iconColor: "destructive" },
  ];

  return (
    <div className="space-y-6">
      <StatCard stats={stats} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{statsData?.global_stats?.waiting_in_queue ?? 0}</div>
          <div>Waiting in queue</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{statsData?.global_stats?.assigned_to_moderators ?? 0}</div>
          <div>Assigned to moderators</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{statsData?.global_stats?.closed_today ?? 0}</div>
          <div>Closed today</div>
        </Card>
      </div>

      <AgTable
        title="Moderator Activity"
        columnDefs={[
          { field: "moderator", headerName: "Moderator", flex: 1 },
          { field: "assignment", headerName: "Assignment" },
          { field: "resolvedReports", headerName: "Resolved Reports" },
          { field: "pendingReports", headerName: "Pending Reports" },
        ]}
        rowData={statsData?.moderator_activity || []}
      />

      <AgTable
        title="Reports Assignment"
        columnDefs={[
          { field: "id", headerName: "Report ID", width: 250 },
          { field: "reporter_name", headerName: "Reporter", width: 150 },
          { field: "reported_user_name", headerName: "Reported User", width: 150 },
          { field: "reason", headerName: "Reason", width: 150 },
          { field: "status", headerName: "Status", width: 120 },
          {
            field: "priority",
            headerName: "Priority",
            width: 150,
            cellRenderer: (params: any) => {
              const val = params.data?.priority || "Medium";
              return (
                <div onClick={e => e.stopPropagation()}>
                  <Select
                    value={val}
                    onValueChange={(v) => updateReport(params.data.id, { priority: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )
            }
          },
          {
            field: "assign_to",
            headerName: "Assign To",
            width: 250,
            cellRenderer: (params: any) => {
              const val = params.data?.assign_to;
              return (
                <div onClick={e => e.stopPropagation()}>
                  <Select
                    value={val?.toString() || "unassigned"}
                    onValueChange={(v) => updateReport(params.data.id, { assign_to: v === "unassigned" ? null : v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Assign Moderator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {moderators.map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.full_name || m.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            }
          },
        ]}
        rowData={reports}
      />
    </div>
  )
}
