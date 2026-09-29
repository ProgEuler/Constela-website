"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { AgTable } from "@/components/shared/AgTable";
import { UserActionsCell } from "./_components/user-actions-cell";
import type { UserRow } from "./_components/data";

type ApiUser = {
  id: string;
  username: string;
  user: { email: string; is_active?: boolean; date_joined?: string };
  subscription_tier: string;
  subscription_expires?: string;
  photos?: { image: string; is_main: boolean }[];
  age?: number;
  location?: string;
};

function tierToLabel(tier: string): string {
  switch (tier) {
    case "plus": return "Premium Plus";
    case "light": return "Premium Light";
    default: return "Free";
  }
}

export default function Page() {
  const { data, error, isLoading, mutate } = useSWR<ApiUser[]>("/api/admin/users/");
  const users: UserRow[] = (data ?? []).map((u) => ({
        id: u.id,
        name: u.username,
        email: u.user?.email ?? "",
        role: "Member",
        status: u.user?.is_active === false ? "Locked" : "Active",
        team: "Platform",
        workspace: [],
        joinedDate: u.user?.date_joined ? new Date(u.user.date_joined).toLocaleString() : "—",
        lastActive: 0,
        location: u.location,
        subscription: tierToLabel(u.subscription_tier),
      }));

  useEffect(() => {
    if (error) toast.error(error.message ?? "Failed to load users.", { id: "users-load" });
  }, [error]);

  return (
    <div className="space-y-4">
      <AgTable
        height={800}
        components={{ userActionsCell: UserActionsCell }}
        context={{ reloadUsers: mutate }}
        columnDefs={[
          { field: "name", headerName: "Name", cellClass: "font-medium", minWidth: 160 },
          { field: "email", headerName: "Email", minWidth: 220 },
          { field: "location", headerName: "Location", minWidth: 160 },
          { field: "subscription", headerName: "Subscription" },
          { field: "status", headerName: "Status" },
          { field: "joinedDate", headerName: "Joined Date" },
          {
            field: "actions",
            headerName: "Actions",
            maxWidth: 90,
            sortable: false,
            filter: false,
            cellRenderer: "userActionsCell",
            cellClass: "flex items-center justify-center",
          },
        ]}
        rowData={users}
        loading={isLoading}
        pagination
        pageSize={20}
      />
    </div>
  );
}
