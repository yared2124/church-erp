"use client";

import * as React from "react";
import { Wallet2, TrendingUp, AlertCircle, CheckCircle2, XCircle, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { FamilyPaymentTable } from "@/components/families/family-payment-table";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { FamilyPaymentStatsResponse } from "@/features/family-payments/family-payment.types";

export default function FamilyPaymentsPage() {
  const [stats, setStats] = React.useState<FamilyPaymentStatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = React.useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<{ data: FamilyPaymentStatsResponse }>("/api/family-payments/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load payment statistics."))
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
          { label: "Family Payments" },
        ]}
        title="Family Payments"
        description="Sebeka Gubae payments, recorded per family household"
        actions={<Button icon={<Plus size={16} />} href="/members/family-payments/new">Record Payment</Button>}
      />

      {error && (
        <div className="mb-5 rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Collected" value={loading ? "…" : (stats?.totalCollected ?? 0).toLocaleString()} suffix="ETB" icon={Wallet2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Expected Amount" value={loading ? "…" : (stats?.expected ?? 0).toLocaleString()} suffix="ETB" icon={TrendingUp} iconBg="bg-info-bg" iconColor="text-info" />
        <StatCard label="Outstanding" value={loading ? "…" : (stats?.outstanding ?? 0).toLocaleString()} suffix="ETB" icon={AlertCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Families Paid" value={loading ? "…" : String(stats?.familiesPaid ?? 0)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Families Unpaid" value={loading ? "…" : String(stats?.familiesUnpaid ?? 0)} icon={XCircle} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <FamilyPaymentTable />
      </Card>
    </PageContainer>
  );
}
