import { Metadata } from "next";
import { LogsTable } from "./_components/logs-table";

export const metadata: Metadata = {
  title: "System Logs - Constela Admin",
  description: "View and manage system and admin action logs.",
};

export default function SystemLogsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <LogsTable />
      </div>
    </div>
  );
}
