import type { Metadata } from "next";
import { Wallet2, TrendingUp, AlertCircle, CheckCircle2, XCircle, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { FamilyPaymentTable } from "@/components/families/family-payment-table";
import { requireAuth } from "@/lib/api-helpers";
import { familyPaymentService } from "@/features/family-payments/family-payment.service";

export const metadata: Metadata = {
  title: "Sebeka Payments — Birhane Genet St. Mary Church",
};

export default async function SebekaPaymentsPage() {
  await requireAuth();
  const stats = await familyPaymentService.stats();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Financial Management", href: "/finance" },
          { label: "Sebeka Payments" },
        ]}
        title="Financial Management"
        description="Same records as Members & Families → Family Payments, viewed from the finance module"
        actions={<Button icon={<Plus size={16} />} href="/members/family-payments/new">Record Payment</Button>}
      />

      <FinanceTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Collected" value={stats.totalCollected.toLocaleString()} suffix="ETB" icon={Wallet2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Expected Amount" value={stats.expected.toLocaleString()} suffix="ETB" icon={TrendingUp} iconBg="bg-info-bg" iconColor="text-info" />
        <StatCard label="Outstanding" value={stats.outstanding.toLocaleString()} suffix="ETB" icon={AlertCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Families Paid" value={String(stats.familiesPaid)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Families Unpaid" value={String(stats.familiesUnpaid)} icon={XCircle} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <FamilyPaymentTable />
      </Card>
    </PageContainer>
  );
}
