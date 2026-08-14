"use client";

import { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AgTable } from "@/components/shared/AgTable";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

type ApiLog = {
  id: string;
  admin_user: number;
  admin_name: string;
  admin_email: string;
  target_user?: number | null;
  target_name?: string | null;
  action: string;
  details?: string | null;
  timestamp: string;
};

export function LogsTable() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.get<ApiLog[]>("/api/admin/logs/");
        setLogs(data);
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to load system logs.");
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const columnDefs: ColDef<ApiLog>[] = [
    {
      field: "id",
      headerName: "Log ID",
      minWidth: 100,
      maxWidth: 120,
      cellClass: "font-mono text-xs text-muted-foreground",
      valueFormatter: (params) => String(params.value).slice(0, 8),
    },
    {
      field: "timestamp",
      headerName: "Date & Time",
      minWidth: 160,
      valueFormatter: (params) => format(new Date(params.value), "PP pp"),
    },
    {
      field: "admin_name",
      headerName: "Admin User",
      minWidth: 150,
      cellRenderer: (params: { data: ApiLog }) => {
        return (
          <div className="flex flex-col justify-center h-full">
            <span className="font-medium text-sm leading-none">{params.data.admin_name || "System"}</span>
            <span className="text-xs text-muted-foreground mt-1 leading-none">{params.data.admin_email}</span>
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action Performed",
      minWidth: 180,
      cellClass: "font-medium",
    },
    {
      field: "target_name",
      headerName: "Target Profile",
      minWidth: 150,
      valueFormatter: (params) => params.value || "—",
    },
    {
      field: "details",
      headerName: "Details",
      minWidth: 200,
      flex: 1,
      valueFormatter: (params) => params.value || "—",
      tooltipField: "details",
    },
  ];

  return (
    <AgTable
      title="System Audit Logs"
      rowData={isLoading ? [] : logs}
      columnDefs={columnDefs}
      pagination
      pageSize={15}
      height="calc(100vh - 220px)"
      minHeight={500}
      showRowNumberColumn={false}
    />
  );
}
