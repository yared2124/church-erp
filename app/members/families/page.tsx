"use client";

import * as React from "react";
import { Home, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { FamiliesWorkspace } from "@/components/families/families-workspace";
import { FamiliesBySebekaStatusCard, FamiliesByYearCard } from "@/components/families/family-insights";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { FamilyStatsResponse } from "@/features/families/family.types";

export default function FamiliesPage() {
  const [stats, setStats] = React.useState<FamilyStatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = React.useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<{ data: FamilyStatsResponse }>("/api/families/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load family statistics."))
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
          { label: "Families" },
        ]}
        title="Families"
        description="Manage church families and household information"
        actions={<Button icon={<Plus size={16} />}>Add Family</Button>}
      />

      {error && (
        <div className="mb-5 rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Families"
          value={loading ? "…" : (stats?.total ?? 0).toLocaleString()}
          icon={Home}
          iconBg="bg-primary-light"
          iconColor="text-primary"
        />
        <StatCard
          label="Active Families"
          value={loading ? "…" : (stats?.active ?? 0).toLocaleString()}
          icon={CheckCircle2}
          iconBg="bg-success-bg"
          iconColor="text-success"
        />
        <StatCard
          label="Outstanding Payments"
          value={loading ? "…" : (stats?.outstanding ?? 0).toLocaleString()}
          icon={AlertTriangle}
          iconBg="bg-warning-bg"
          iconColor="text-warning"
        />
      </div>

      <div className="mb-5">
        <FamiliesWorkspace />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <FamiliesBySebekaStatusCard stats={stats} loading={loading} />
        <FamiliesByYearCard stats={stats} loading={loading} />
      </div>
    </PageContainer>
  );
}
