"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Inbox, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AgTable } from "@/components/shared/AgTable";
import StatCard, { type Stat } from "@/components/shared/stat-card";
import { api } from "@/lib/api";

type Ticket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
};

type StatsData = {
  pending_tickets: number;
  total_users: number;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-500 border-transparent",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-500 border-transparent",
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-500 border-transparent",
};

export default function OverviewDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ticketData, statData] = await Promise.all([
        api.get<Ticket[]>("/api/admin/tickets/"),
        api.get<StatsData>("/api/admin/dashboard/stats/"),
      ]);
      setTickets(ticketData);
      setStatsData(statData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = tickets.filter((t) => t.status !== "resolved" && t.status !== "in_progress");
  const replied = tickets.filter((t) => t.status === "in_progress");
  const resolved = tickets.filter((t) => t.status === "resolved");

  const stats: Stat[] = [
    { label: "Open", value: String(open.length), icon: Inbox, iconColor: "warning" },
    { label: "Replied", value: String(replied.length), icon: MessageSquare },
    { label: "Resolved", value: String(resolved.length), icon: CheckCircle2 },
    { label: "Total", value: String(tickets.length), icon: Clock },
  ];

  const rowData = tickets.map((t) => ({
    user: t.name,
    subject: {
      title: t.subject,
      snippet: t.message?.slice(0, 80) + (t.message?.length > 80 ? "…" : ""),
    },
    received: timeAgo(t.created_at),
    priority: {
      label: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : "Low",
      color: PRIORITY_STYLES[t.priority?.toLowerCase()] ?? PRIORITY_STYLES.low,
    },
    status: t.status === "in_progress" ? "In Progress" : t.status === "resolved" ? "Resolved" : "Open",
  }));

  return (
    <div className="space-y-6">
      <StatCard stats={stats} />
      <AgTable
        title="Support Tickets"
        gridOptions={{ rowHeight: 56 }}
        columnDefs={[
          { headerName: "User", field: "user", cellRenderer: "tableUserCell", maxWidth: 200 },
          {
            headerName: "Subject",
            field: "subject",
            flex: 1,
            minWidth: 400,
            cellRenderer: (params: { value: { title: string; snippet: string } }) => (
              <div className="flex flex-col">
                <span className="truncate text-sm">{params.value.title}</span>
                <span className="truncate text-xs text-muted-foreground">{params.value.snippet}</span>
              </div>
            ),
          },
          {
            headerName: "Received",
            field: "received",
            maxWidth: 160,
            cellRenderer: (params: { value: string }) => (
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {params.value}
              </div>
            ),
          },
          {
            headerName: "Priority",
            field: "priority",
            maxWidth: 120,
            cellRenderer: (params: { value: { color: string; label: string } }) => (
              <Badge variant="outline" className={params.value.color}>
                {params.value.label}
              </Badge>
            ),
          },
          {
            headerName: "Status",
            field: "status",
            maxWidth: 140,
            cellRenderer: (params: { value: string }) => (
              <Badge variant="secondary" className="border-transparent bg-muted/50 font-medium text-muted-foreground">
                {params.value}
              </Badge>
            ),
          },
        ]}
        rowData={isLoading ? [] : rowData}
      />
    </div>
  );
}
