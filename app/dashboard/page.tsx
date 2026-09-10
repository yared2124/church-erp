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
import { auth } from "@/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard — Birhane Genet St. Mary Church",
};

export default async function DashboardPage() {
  await requireAuth();
  const session = await auth();
  const userRoles = session?.user?.roles ?? [];

  const hasFinance = userRoles.some((r) =>
    ["Super Admin", "Cashier", "Sebeka Gubae"].includes(r)
  );
  const hasSacraments = userRoles.some((r) =>
    ["Super Admin", "Priest"].includes(r)
  );
  const hasProperty = userRoles.some((r) =>
    ["Super Admin", "Property Manager", "Sebeka Gubae"].includes(r)
  );

  const s = await dashboardService.overview();

  // Filter pending approvals based on user permissions
  const visibleExpenses = hasFinance ? s.pendingExpenses : [];
  const visibleCerts = (hasSacraments || userRoles.includes("Registrar")) ? s.pendingCertRequests : [];
  const showApprovals = visibleExpenses.length > 0 || visibleCerts.length > 0;

  const operationalCount =
    (hasSacraments ? 1 : 0) + (hasProperty ? 1 : 0) + (showApprovals ? 1 : 0);
  const colSpanClass =
    operationalCount === 1
      ? "lg:col-span-12"
      : operationalCount === 2
      ? "lg:col-span-6"
      : "lg:col-span-4";

  return (
    <PageContainer>
      <DashboardHeader />

      {/* KPI row */}
      <div
        className={cn(
          "mb-5 grid grid-cols-1 gap-4",
          hasFinance ? "sm:grid-cols-2 xl:grid-cols-5" : "sm:grid-cols-2"
        )}
      >
        <StatCard
          label="Total Members"
          value={s.totalMembers.toLocaleString()}
          icon={Users}
          iconBg="bg-primary-light"
          iconColor="text-primary"
        />
        <StatCard
          label="Sebeka Families Paid"
          value={String(s.sebekaFamiliesPaid)}
          icon={PiggyBank}
          iconBg="bg-success-bg"
          iconColor="text-success"
        />
        {hasFinance && (
          <>
            <StatCard
              label="Total Income"
              value={s.totalIncome.toLocaleString()}
              suffix="ETB"
              icon={TrendingUp}
              iconBg="bg-info-bg"
              iconColor="text-info"
            />
            <StatCard
              label="Total Expenses"
              value={s.totalExpenses.toLocaleString()}
              suffix="ETB"
              icon={Wallet2}
              iconBg="bg-danger-bg"
              iconColor="text-danger"
            />
            <StatCard
              label="Net Balance"
              value={s.netBalance.toLocaleString()}
              suffix="ETB"
              icon={Landmark}
              iconBg="bg-primary-light"
              iconColor="text-primary"
            />
          </>
        )}
      </div>

      {/* Analytics row (Finance only) */}
      {hasFinance && (
        <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
          <IncomeExpenseChart data={s.monthlyTrend} />
          <RecentTransactions transactions={s.recentTransactions} />
        </div>
      )}

      {/* Operational row */}
      {operationalCount > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {hasSacraments && (
            <SacramentSummary
              counts={s.sacramentsByType}
              className={colSpanClass}
            />
          )}
          {hasProperty && (
            <OverdueRentals
              rentals={s.overdueRentPayments}
              className={colSpanClass}
            />
          )}
          {showApprovals && (
            <PendingApprovals
              pendingExpenses={visibleExpenses}
              pendingCertRequests={visibleCerts}
              className={colSpanClass}
            />
          )}
        </div>
      )}

      {/* Announcement */}
      <div className="grid grid-cols-12 gap-4">
        <AnnouncementBanner />
      </div>
    </PageContainer>
  );
}
