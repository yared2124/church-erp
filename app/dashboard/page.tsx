import type { Metadata } from "next";
import { Users, PiggyBank, TrendingUp, Wallet2, Landmark } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/ui/stat-card";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SacramentSummary } from "@/components/dashboard/sacrament-summary";
import { OverdueRentals } from "@/components/dashboard/overdue-rentals";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { AnnouncementBanner } from "@/components/dashboard/announcement-banner";
import { requireAuth } from "@/lib/api-helpers";
import { dashboardService } from "@/features/dashboard/dashboard.service";

export const metadata: Metadata = {
  title: "Dashboard — Birhane Genet St. Mary Church",
};

export default async function DashboardPage() {
  await requireAuth();
  const s = await dashboardService.overview();

  return (
    <PageContainer>
      <DashboardHeader />

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Members" value={s.totalMembers.toLocaleString()} icon={Users} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Sebeka Families Paid" value={String(s.sebekaFamiliesPaid)} icon={PiggyBank} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Total Income" value={s.totalIncome.toLocaleString()} suffix="ETB" icon={TrendingUp} iconBg="bg-info-bg" iconColor="text-info" />
        <StatCard label="Total Expenses" value={s.totalExpenses.toLocaleString()} suffix="ETB" icon={Wallet2} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Net Balance" value={s.netBalance.toLocaleString()} suffix="ETB" icon={Landmark} iconBg="bg-primary-light" iconColor="text-primary" />
      </div>

      {/* Analytics row */}
      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <IncomeExpenseChart data={s.monthlyTrend} />
        <RecentTransactions transactions={s.recentTransactions} />
      </div>

      {/* Operational row */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <SacramentSummary counts={s.sacramentsByType} />
        <OverdueRentals rentals={s.overdueRentPayments} />
        <PendingApprovals pendingExpenses={s.pendingExpenses} pendingCertRequests={s.pendingCertRequests} />
      </div>

      {/* Announcement */}
      <div className="grid grid-cols-12 gap-4">
        <AnnouncementBanner />
      </div>
    </PageContainer>
  );
}
