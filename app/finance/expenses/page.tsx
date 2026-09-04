import type { Metadata } from "next";
import { Wallet2, Plus } from "lucide-react";
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
  title: "Expenses — Birhane Genet St. Mary Church",
};

export default async function ExpensesPage() {
  await requireAuth();

  const [count, totalAgg, pendingAgg] = await Promise.all([
    prisma.transaction.count({ where: { type: "Expense" } }),
    prisma.transaction.aggregate({ where: { type: "Expense" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "Expense", status: "Pending" }, _sum: { amount: true } }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Financial Management", href: "/finance" },
          { label: "Expenses" },
        ]}
        title="Financial Management"
        actions={<Button icon={<Plus size={16} />}>Add Expense</Button>}
      />

      <FinanceTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Expense Entries" value={String(count)} icon={Wallet2} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Total Amount" value={Number(totalAgg._sum.amount ?? 0).toLocaleString()} suffix="ETB" icon={Wallet2} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Pending Approval" value={Number(pendingAgg._sum.amount ?? 0).toLocaleString()} suffix="ETB" icon={Wallet2} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <TransactionTable fixedType="Expense" />
      </Card>
    </PageContainer>
  );
}
