"use client";

import { useCallback, useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { ArrowRight, CircleCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgTable } from "@/components/shared/AgTable";
import { api } from "@/lib/api";

import { TakeActionSheet } from "./_components/take-action-sheet";
import { priorityMeta, type ReportRow, type ReportPriority } from "./_components/report-data";

type ApiReport = {
  id: string;
  reporter: string;
  reporter_name?: string;
  reported_user: string;
  reported_user_name?: string;
  reason: string;
  status: string;
  action_taken?: string;
  created_at: string;
};

function toPriority(status: string): ReportPriority {
  if (status === "resolved") return "Low";
  return "High";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs} hrs ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function toReportRow(r: ApiReport): ReportRow {
  return {
    reportId: `RPT-${String(r.id).slice(0, 6).toUpperCase()}`,
    reportedUser: r.reported_user_name ?? "Unknown",
    reason: r.reason,
    priority: toPriority(r.status),
    reportedBy: r.reporter_name ?? "Unknown",
    history: "—",
    time: timeAgo(r.created_at),
    status: r.status === "resolved" ? "Resolved" : r.status === "under_review" ? "In Progress" : "Open",
    details: `Report against ${r.reported_user_name ?? r.reported_user}. Reason: ${r.reason}.`,
    _rawId: r.id,
  } as ReportRow & { _rawId: string };
}

function PriorityBadge({ priority }: { priority: ReportPriority }) {
  const meta = priorityMeta[priority];
  return (
    <Badge className={cn("gap-1.5 border px-2 py-0.5 font-medium", meta.className)} variant="outline">
      {meta.label}
    </Badge>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<(ReportRow & { _rawId?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionReport, setActionReport] = useState<ReportRow | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<ApiReport[]>("/api/admin/reports/");
      setReports(data.map(toReportRow));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCases = reports.filter((r) => r.status !== "Resolved");
  const resolvedReports = reports.filter((r) => r.status === "Resolved");

  const openActionSheet = (report: ReportRow) => {
    setActionReport(report);
    setActionSheetOpen(true);
  };

  const handleActionTaken = async (reportId: string, action: string) => {
    try {
      const rawId = (reports.find((r) => r.reportId === reportId) as any)?._rawId ?? reportId;
      await api.post(`/api/admin/reports/${rawId}/take_action/`, { action });
      toast.success(`Action "${action}" applied successfully.`);
      setActionSheetOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to apply action.");
    }
  };

  const reportIdCol: ColDef<ReportRow> = { field: "reportId", headerName: "Report ID", minWidth: 110, maxWidth: 130, cellClass: "font-mono text-xs" };
  const reportedUserCol: ColDef<ReportRow> = { field: "reportedUser", headerName: "Reported user", cellRenderer: "tableUserCell", minWidth: 180 };
  const reasonCol: ColDef<ReportRow> = { field: "reason", headerName: "Reason", minWidth: 160 };
  const priorityCol: ColDef<ReportRow> = {
    field: "priority", headerName: "Priority", minWidth: 110, maxWidth: 130,
    cellRenderer: (params: { value: ReportPriority }) => <PriorityBadge priority={params.value} />,
  };
  const reportedByCol: ColDef<ReportRow> = { field: "reportedBy", headerName: "Reported by", cellRenderer: "tableUserCell", minWidth: 180 };
  const timeCol: ColDef<ReportRow> = { field: "time", headerName: "Time", minWidth: 120, maxWidth: 140 };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All reports <Badge variant="secondary">{reports.length}</Badge></TabsTrigger>
          <TabsTrigger value="my-cases">Open cases <Badge variant="secondary">{openCases.length}</Badge></TabsTrigger>
          <TabsTrigger value="resolved">Resolved <Badge variant="secondary">{resolvedReports.length}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AgTable title={`${reports.length} reports`} rowData={isLoading ? [] : reports} showRowNumberColumn={false} pagination pageSize={10} height="auto" minHeight={400}
            columnDefs={[reportIdCol, reportedUserCol, reasonCol, priorityCol, reportedByCol, timeCol]}
          />
        </TabsContent>

        <TabsContent value="my-cases">
          {actionReport && (
            <TakeActionSheet report={actionReport} open={actionSheetOpen} onOpenChange={setActionSheetOpen} />
          )}
          <AgTable title={`${openCases.length} open cases`} rowData={isLoading ? [] : openCases} showRowNumberColumn={false} pagination pageSize={10} height="auto" minHeight={400}
            columnDefs={[reportIdCol, reportedUserCol, reasonCol, priorityCol, reportedByCol, timeCol]}
          />
        </TabsContent>

        <TabsContent value="resolved">
          <AgTable title={`${resolvedReports.length} resolved reports`} rowData={isLoading ? [] : resolvedReports} showRowNumberColumn={false} pagination pageSize={10} height="auto" minHeight={400}
            columnDefs={[reportIdCol, reportedUserCol, reasonCol, priorityCol, reportedByCol, timeCol]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
