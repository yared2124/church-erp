"use client";

import * as React from "react";
import { Users, CheckCircle2, UserX, Lock, ShieldCheck, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { UsersTabs, type UsersTab } from "@/components/users/users-tabs";
import { UserTable, type ApiSystemUser } from "@/components/users/user-table";
import { RolesPermissionsPanel } from "@/components/users/roles-permissions-panel";
import { RolesSummaryCard, SelectedUserDetailsCard } from "@/components/users/user-side-panels";
import { UserDetailDialog } from "@/components/users/user-detail-dialog";
import { UserModal } from "@/components/users/user-modal";
import { UserDeleteDialog } from "@/components/users/user-delete-dialog";
import { apiFetch, ApiClientError } from "@/lib/api-client";

interface UserStats { total: number; active: number; inactive: number; locked: number }
interface RoleSummary { id: string; name: string; users: number; permissions: string[] }

export default function UsersPage() {
  const [tab, setTab] = React.useState<UsersTab>("Users");
  const [selected, setSelected] = React.useState<ApiSystemUser | null>(null);
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [roles, setRoles] = React.useState<RoleSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Modals state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [userToEdit, setUserToEdit] = React.useState<ApiSystemUser | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<ApiSystemUser | null>(null);

  const fetchOverview = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch<{ data: UserStats }>("/api/users/stats"),
      apiFetch<{ data: RoleSummary[] }>("/api/users/roles"),
    ])
      .then(([statsRes, rolesRes]) => {
        setStats(statsRes.data);
        setRoles(rolesRes.data);
      })
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load user data."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleMutationSuccess = () => {
    setRefreshKey((k) => k + 1);
    fetchOverview();
    setSelected(null);
  };

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: ApiSystemUser) => {
    setUserToEdit(user);
    setModalOpen(true);
  };

  const handleOpenDelete = (user: ApiSystemUser) => {
    setUserToDelete(user);
  };

  const roleOptions = roles.map((r) => r.name);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Users & Roles" },
        ]}
        title="Users & Roles"
        description="Manage system users, roles, and permissions"
        actions={
          <Button icon={<Plus size={16} />} onClick={handleOpenCreate}>
            Add New User
          </Button>
        }
      />

      {error && <div className="mb-5 rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">{error}</div>}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Users" value={loading ? "…" : String(stats?.total ?? 0)} icon={Users} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Active Users" value={loading ? "…" : String(stats?.active ?? 0)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Inactive Users" value={loading ? "…" : String(stats?.inactive ?? 0)} icon={UserX} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Locked Users" value={loading ? "…" : String(stats?.locked ?? 0)} icon={Lock} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Roles" value={loading ? "…" : String(roles.length)} icon={ShieldCheck} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <UsersTabs value={tab} onChange={setTab} />

      {tab === "Users" ? (
        <div className="w-full">
          <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-card sm:p-5">
            <UserTable
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              roleOptions={roleOptions}
              refreshKey={refreshKey}
            />
          </div>

          {/* Pop-up Modal Dialog with Back Button */}
          <UserDetailDialog
            user={selected}
            open={!!selected}
            onOpenChange={(open) => {
              if (!open) setSelected(null);
            }}
            onEdit={handleOpenEdit}
          />
        </div>
      ) : (
        <RolesPermissionsPanel roles={roles} />
      )}

      {/* Add / Edit User Modal */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleMutationSuccess}
        user={userToEdit}
        roleOptions={roleOptions}
      />

      {/* Delete User Dialog */}
      <UserDeleteDialog
        open={!!userToDelete}
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onDeleted={handleMutationSuccess}
      />
    </PageContainer>
  );
}
