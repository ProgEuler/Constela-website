"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgTable } from "@/components/shared/AgTable";
import { useRouter } from "next/navigation";

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
  high: "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-500/20 dark:text-red-500 border-transparent",
  medium: "bg-amber-100 text-amber-800 hover:bg-amber-100/80 dark:bg-amber-500/20 dark:text-amber-500 border-transparent",
  low: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 dark:bg-emerald-500/20 dark:text-emerald-500 border-transparent",
};

function toRowData(tickets: Ticket[]) {
  return tickets.map((t) => ({
    id: t.id,
    user: t.name || "Unknown User",
    subject: {
      title: t.subject,
      snippet: t.message?.slice(0, 80) + (t.message?.length > 80 ? "…" : ""),
    },
    received: timeAgo(t.created_at),
    status: t.status === "in_progress" ? "In Progress" : t.status === "resolved" ? "Resolved" : "Open",
    action: t.id,
  }));
}

const sharedColumns = (router: ReturnType<typeof useRouter>, showOpen?: boolean): any[] => [
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
    headerName: "Status",
    field: "status",
    maxWidth: 140,
    cellRenderer: (params: { value: string }) => (
      <Badge variant="secondary" className="border-transparent bg-muted/50 font-medium text-muted-foreground hover:bg-muted/60">
        {params.value}
      </Badge>
    ),
  },
  {
    headerName: "Action",
    field: "action",
    maxWidth: 140,
    cellRenderer: (params: { value: string }) => (
      <Button size="sm" onClick={() => router.push(`/dashboard/support/support-tickets/${params.value}`)}>
        Open <ArrowRight className="ml-1 size-3" />
      </Button>
    ),
  },
];

export default function SupportTicketsPage() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<Ticket[]>("/api/admin/tickets/");
  const tickets = data ?? [];

  useEffect(() => {
    if (error) toast.error(error.message ?? "Failed to load tickets.", { id: "tickets-load" });
  }, [error]);

  const open = tickets.filter((t) => t.status !== "resolved");
  const resolved = tickets.filter((t) => t.status === "resolved");
  const cols = sharedColumns(router);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All Tickets <Badge variant="secondary">{tickets.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="open">
            Open <Badge variant="secondary">{open.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved <Badge variant="secondary">{resolved.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
          <AgTable gridOptions={{ rowHeight: 56 }} columnDefs={cols} rowData={toRowData(tickets)} loading={isLoading} />
        </TabsContent>

        <TabsContent value="open" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
          <AgTable gridOptions={{ rowHeight: 56 }} columnDefs={cols} rowData={toRowData(open)} loading={isLoading} />
        </TabsContent>

        <TabsContent value="resolved" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
          <AgTable gridOptions={{ rowHeight: 56 }} columnDefs={cols} rowData={toRowData(resolved)} loading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
