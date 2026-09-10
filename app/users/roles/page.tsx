"use client";

import * as React from "react";
import { ShieldCheck, Users, CheckCircle2, Lock, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { UsersTabs } from "@/components/users/users-tabs";
import { RolesPermissionsPanel, type RoleSummary } from "@/components/users/roles-permissions-panel";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { useLanguage } from "@/lib/language-context";

interface UserStats { total: number; active: number; inactive: number; locked: number }

export default function RolesAndPermissionsPage() {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [roles, setRoles] = React.useState<RoleSummary[]>([]);
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load roles."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Users & Roles", href: "/users" },
          { label: isAmharic ? "ሚናዎችና ፈቃዶች" : "Roles & Permissions" },
        ]}
        title={isAmharic ? "የተጠቃሚ ሚናዎችና ፈቃዶች" : "Roles & Permissions"}
        description={
          isAmharic
            ? "የሲስተም ሚናዎች፣ የተሰጡ ፈቃዶችና በእያንዳንዱ ሚና ያሉ ተጠቃሚዎች ዝርዝር"
            : "Manage system roles, inspect assigned permissions, and view role memberships"
        }
        actions={
          <a href="/users">
            <Button variant="secondary" icon={<Users size={16} />}>
              {isAmharic ? "ወደ ተጠቃሚዎች ዝርዝር" : "Back to Users"}
            </Button>
          </a>
        }
      />

      {error && (
        <div className="mb-5 rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={isAmharic ? "ጠቅላላ ሚናዎች" : "Total Roles"}
          value={loading ? "…" : String(roles.length)}
          icon={ShieldCheck}
          iconBg="bg-primary-light"
          iconColor="text-primary"
        />
        <StatCard
          label={isAmharic ? "ጠቅላላ ተጠቃሚዎች" : "Total Users"}
          value={loading ? "…" : String(stats?.total ?? 0)}
          icon={Users}
          iconBg="bg-info-bg"
          iconColor="text-info"
        />
        <StatCard
          label={isAmharic ? "ንቁ ተጠቃሚዎች" : "Active Users"}
          value={loading ? "…" : String(stats?.active ?? 0)}
          icon={CheckCircle2}
          iconBg="bg-success-bg"
          iconColor="text-success"
        />
        <StatCard
          label={isAmharic ? "የታገዱ አካውንቶች" : "Locked Accounts"}
          value={loading ? "…" : String(stats?.locked ?? 0)}
          icon={Lock}
          iconBg="bg-danger-bg"
          iconColor="text-danger"
        />
      </div>

      <UsersTabs value="Roles & Permissions" />

      <div className="w-full">
        <RolesPermissionsPanel roles={roles} />
      </div>
    </PageContainer>
  );
}
