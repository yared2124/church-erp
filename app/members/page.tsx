"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Users, UserCheck, UserX, UserPlus, Upload, Download, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { MembersWorkspace } from "@/components/members/members-workspace";
import { MembersByGenderCard, MembersByAgeGroupCard } from "@/components/members/member-insights";
import { RecentMembersCard, MemberQuickActions } from "@/components/members/member-quick-actions";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { MemberStatsResponse } from "@/features/members/member.types";

export default function MembersPage() {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles ?? [];
  const isAdmin = userRoles.includes("Super Admin");

  const [stats, setStats] = React.useState<MemberStatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = React.useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<{ data: MemberStatsResponse }>("/api/members/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load member statistics."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Members & Families", href: "/members" },
          { label: "Members" },
        ]}
        title="Members"
        description="Manage church members and their information"
        actions={
          <>
            <Button variant="secondary" icon={<Upload size={16} />}>
              Import Members
            </Button>
            <Button variant="secondary" icon={<Download size={16} />}>
              Export
            </Button>
            {isAdmin && (
              <Button icon={<Plus size={16} />} href="/members/new">
                Add Member
              </Button>
            )}
          </>
        }
      />

      {error && (
        <div className="mb-5 rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Members"
          value={loading ? "…" : (stats?.total ?? 0).toLocaleString()}
          icon={Users}
          iconBg="bg-primary-light"
          iconColor="text-primary"
        />
        <StatCard
          label="Active Members"
          value={loading ? "…" : (stats?.active ?? 0).toLocaleString()}
          icon={UserCheck}
          iconBg="bg-success-bg"
          iconColor="text-success"
        />
        <StatCard
          label="Inactive Members"
          value={loading ? "…" : (stats?.inactive ?? 0).toLocaleString()}
          icon={UserX}
          iconBg="bg-warning-bg"
          iconColor="text-warning"
        />
        <StatCard
          label="New This Month"
          value={loading ? "…" : (stats?.newThisMonth ?? 0).toLocaleString()}
          icon={UserPlus}
          iconBg="bg-info-bg"
          iconColor="text-info"
        />
      </div>

      <div className="mb-5">
        <MembersWorkspace />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <MembersByGenderCard stats={stats} loading={loading} />
        <MembersByAgeGroupCard stats={stats} loading={loading} />
        <RecentMembersCard stats={stats} loading={loading} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <MemberQuickActions />
      </div>
    </PageContainer>
  );
}
