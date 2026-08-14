"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AgTable } from "@/components/shared/AgTable";
import { Button } from "@/components/ui/button";
import { AddAdminDialog } from "./_components/add-admin";
import { EditAdminDialog, type AdminUser } from "./_components/edit-admin";
import { api } from "@/lib/api";

type AdminAccount = {
  id: string;
  full_name: string;
  admin_id: string;
  email: string;
  role: string;
  role_display: string;
  status: string;
  last_login: string;
};

// Map UI role label to backend role slug
const ROLE_SLUG_MAP: Record<string, string> = {
  "Admin": "admin",
  "Moderator": "moderator",
  "Super Admin": "superadmin",
  "Customer Support": "support",
};

export default function Page() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("admin");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, profileData] = await Promise.all([
        api.get<AdminAccount[]>("/api/admin/accounts/"),
        api.get<any>("/api/profile/me/")
      ]);
      setAccounts(data);
      setCurrentUserRole(profileData.user?.role || "admin");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load admin accounts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    try {
      await api.post("/api/admin/accounts/", {
        full_name: data.name,
        email: data.email,
        role: ROLE_SLUG_MAP[data.role] ?? data.role.toLowerCase(),
        password: data.password,
      });
      toast.success("Admin account created successfully.");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create admin account.");
    }
  };

  const handleEdit = async (adminId: string, data: AdminUser) => {
    try {
      await api.patch(`/api/admin/accounts/${adminId}/`, {
        full_name: data.name,
        email: data.email,
        role: ROLE_SLUG_MAP[data.role] ?? data.role.toLowerCase(),
      });
      toast.success("Admin account updated.");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update admin account.");
    }
  };

  const handleDelete = async (adminId: string, name: string) => {
    if (!confirm(`Remove "${name}" from admin accounts? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/accounts/${adminId}/`);
      toast.success("Admin account removed.");
      setAccounts((prev) => prev.filter((a) => a.id !== adminId));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to remove admin account.");
    }
  };

  const adminRows = accounts.map((a) => ({
    id: a.admin_id,
    _rawId: a.id,
    user: a.full_name,
    email: a.email,
    role: a.role_display,
    status: a.status,
    lastLogin: a.last_login,
    actions: "",
    _account: a,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Accounts Management</h1>
        <p className="text-muted-foreground">Add or remove staff accounts and manage permissions.</p>
      </div>
      <div className="flex justify-end">
        <AddAdminDialog currentUserRole={currentUserRole} onCreate={handleCreate} />
      </div>
      <AgTable<typeof adminRows[0]>
        columnDefs={[
          { field: "user", headerName: "User", cellRenderer: "tableUserCell" },
          { field: "email", headerName: "Email" },
          { field: "role", headerName: "Role" },
          { field: "status", headerName: "Status" },
          { field: "lastLogin", headerName: "Last Login" },
          {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            filter: false,
            cellRenderer: (params: { data?: typeof adminRows[0] }) => {
              const row = params.data;
              if (!row) return null;
              const adminUser: AdminUser = {
                id: row._rawId,
                name: row.user,
                email: row.email,
                role: (row._account.role_display as AdminUser["role"]),
              };
              
              const isSuper = currentUserRole === "superadmin";
              const targetIsAdminOrSuper = row._account.role === "admin" || row._account.role === "superadmin";
              const canEditOrDelete = isSuper || !targetIsAdminOrSuper;

              if (!canEditOrDelete) {
                return <span className="text-muted-foreground text-xs">Restricted</span>;
              }

              return (
                <div className="flex items-center gap-2">
                  <EditAdminDialog
                    admin={adminUser}
                    currentUserRole={currentUserRole}
                    onSave={(data) => handleEdit(row._rawId, data)}
                    trigger={
                      <Button variant="outline" size="sm">Edit</Button>
                    }
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(row._rawId, row.user)}
                  >
                    Remove
                  </Button>
                </div>
              );
            },
          },
        ]}
        rowData={isLoading ? [] : adminRows}
      />
    </div>
  );
}
