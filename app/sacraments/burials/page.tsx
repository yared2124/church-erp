"use client";

import * as React from "react";
import { Cross, UserRound, User, CalendarCheck, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { SacramentTabs } from "@/components/sacraments/sacrament-tabs";
import { SacramentsWorkspace } from "@/components/sacraments/sacraments-workspace";
import { SacramentSummaryStrip } from "@/components/sacraments/sacrament-summary-strip";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { SacramentStatsResponse } from "@/features/sacraments/sacrament.types";

export default function BurialsPage() {
  const [stats, setStats] = React.useState<SacramentStatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    apiFetch<{ data: SacramentStatsResponse }>("/api/sacraments/stats?type=Burial")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load statistics."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Sacraments", href: "/sacraments" },
          { label: "Burials" },
        ]}
        title="Sacraments"
        actions={<Button icon={<Plus size={16} />}>Add Burial</Button>}
      />

      <SacramentTabs />

      {error && <div className="mb-5 rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">{error}</div>}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Burials" value={loading ? "…" : String(stats?.total ?? 0)} icon={Cross} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Male" value={loading ? "…" : String(stats?.male ?? 0)} icon={UserRound} iconBg="bg-info-bg" iconColor="text-info" />
        <StatCard label="Female" value={loading ? "…" : String(stats?.female ?? 0)} icon={User} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="This Year" value={loading ? "…" : String(stats?.thisYear ?? 0)} icon={CalendarCheck} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <div className="mb-5">
        <SacramentsWorkspace type="Burial" priestOptions={stats?.priests ?? []} />
      </div>

      {stats && (
        <SacramentSummaryStrip
          type="Burial"
          thisYear={stats.thisYear}
          lastYear={stats.lastYear}
          mostActiveMonth={stats.mostActiveMonth}
          topPriest={stats.topPriest}
          topChurch={stats.topChurch}
        />
      )}
    </PageContainer>
  );
}
