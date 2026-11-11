import { Metadata } from "next";
import { LogsTable } from "./_components/logs-table";

export const metadata: Metadata = {
  title: "System Logs - Constela Admin",
  description: "View and manage system and admin action logs.",
};

export default function SystemLogsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">System Logs</h2>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          View and manage system and admin action logs.
        </p>
      </div>
      <LogsTable />
    </div>
  );
}
