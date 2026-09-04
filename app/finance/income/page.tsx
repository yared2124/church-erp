import type { Metadata } from "next";
import { TrendingUp, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { TransactionTable } from "@/components/finance/transaction-table";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Income — Birhane Genet St. Mary Church",
};

export default async function IncomePage() {
  await requireAuth();

  const [count, totalAgg, paidAgg] = await Promise.all([
    prisma.transaction.count({ where: { type: "Income" } }),
    prisma.transaction.aggregate({ where: { type: "Income" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "Income", status: "Paid" }, _sum: { amount: true } }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Financial Management", href: "/finance" },
          { label: "Income" },
        ]}
        title="Financial Management"
        actions={<Button icon={<Plus size={16} />}>Add Income</Button>}
      />

      <FinanceTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Income Entries" value={String(count)} icon={TrendingUp} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Total Amount" value={Number(totalAgg._sum.amount ?? 0).toLocaleString()} suffix="ETB" icon={TrendingUp} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Received (Paid)" value={Number(paidAgg._sum.amount ?? 0).toLocaleString()} suffix="ETB" icon={TrendingUp} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <Card>
        <TransactionTable fixedType="Income" />
      </Card>
    </PageContainer>
  );
}
