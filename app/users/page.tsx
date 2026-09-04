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

  React.useEffect(() => {
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
        actions={<Button icon={<Plus size={16} />}>Add New User</Button>}
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
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
              <UserTable selectedId={selected?.id ?? null} onSelect={setSelected} roleOptions={roleOptions} />
            </div>
          </div>
          <div className="flex flex-col gap-4 xl:col-span-4">
            <RolesSummaryCard roles={roles} />
            <SelectedUserDetailsCard user={selected} />
          </div>
        </div>
      ) : (
        <RolesPermissionsPanel roles={roles} />
      )}
    </PageContainer>
  );
}
