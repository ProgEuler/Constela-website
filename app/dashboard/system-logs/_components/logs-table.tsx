"use client";

import { useEffect } from "react";
import useSWR from "swr";
import type { ColDef } from "ag-grid-community";
import { AgTable } from "@/components/shared/AgTable";
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
  const { data, error, isLoading } = useSWR<ApiLog[]>("/api/admin/logs/");
  const logs = data ?? [];

  useEffect(() => {
    if (error) toast.error(error.message ?? "Failed to load system logs.", { id: "logs-load" });
  }, [error]);

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
      rowData={logs}
      loading={isLoading}
      columnDefs={columnDefs}
      pagination
      pageSize={20}
      height="calc(100vh - 220px)"
      minHeight={500}
      showRowNumberColumn={false}
    />
  );
}
