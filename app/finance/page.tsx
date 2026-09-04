import type { Metadata } from "next";
import { TrendingUp, Wallet2, PiggyBank, ClipboardCheck, Landmark } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { TransactionTable } from "@/components/finance/transaction-table";
import { IncomeExpenseTrendCard, IncomeByCategoryCard, ExpenseByCategoryCard } from "@/components/finance/finance-charts";
import { SebekaCollectionStatusCard } from "@/components/finance/sebeka-collection-card";
import { FinancialOverviewPanel, FinanceQuickActions } from "@/components/finance/finance-side-panels";
import { requireAuth } from "@/lib/api-helpers";
import { financeService } from "@/features/finance/finance.service";
import { familyPaymentService } from "@/features/family-payments/family-payment.service";

export const metadata: Metadata = {
  title: "Financial Management — Birhane Genet St. Mary Church",
};

export default async function FinanceOverviewPage() {
  await requireAuth();
  const [overview, sebekaStats] = await Promise.all([
    financeService.overview(),
    familyPaymentService.stats(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Financial Management", href: "/finance" },
          { label: "Overview" },
        ]}
        title="Financial Management"
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Income" value={overview.totalIncome.toLocaleString()} suffix="ETB" icon={TrendingUp} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Total Expenses" value={overview.totalExpenses.toLocaleString()} suffix="ETB" icon={Wallet2} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Net Balance" value={overview.netBalance.toLocaleString()} suffix="ETB" icon={Landmark} iconBg="bg-info-bg" iconColor="text-info" />
        <StatCard label="Pending Approvals" value={String(overview.pendingApprovals)} trendLabel="Transactions" icon={ClipboardCheck} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="This Month Collections" value={overview.thisMonthCollections.toLocaleString()} suffix="ETB" icon={PiggyBank} iconBg="bg-primary-light" iconColor="text-primary" />
      </div>

      <FinanceTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <IncomeExpenseTrendCard data={overview.monthlyTrend} />
        <IncomeByCategoryCard data={overview.incomeByCategory} />
      </div>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <TransactionTable limit={5} compact />
      </Card>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <ExpenseByCategoryCard data={overview.expenseByCategory} />
        <SebekaCollectionStatusCard stats={sebekaStats} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <FinancialOverviewPanel overview={overview} unpaidSebekaFamilies={sebekaStats.familiesUnpaid} />
        <FinanceQuickActions />
      </div>
    </PageContainer>
  );
}
