import type { Metadata } from "next";
import { Download, Receipt, Landmark, Calendar } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { GovernanceKpiRow } from "@/components/dashboard/governance-kpi-row";
import { ParishZonesCard } from "@/components/dashboard/parish-zones-card";
import { GovernanceLedgerTable } from "@/components/dashboard/governance-ledger-table";
import { ParishSealCard } from "@/components/dashboard/parish-seal-card";
import { ConfessorsSummaryCard } from "@/components/dashboard/confessors-summary-card";
import { LiveSecurityLogCard } from "@/components/dashboard/live-security-log-card";
import { requireAuth } from "@/lib/api-helpers";
import { dashboardService } from "@/features/dashboard/dashboard.service";
import { PriestDashboardView } from "@/components/dashboard/priest-dashboard-view";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "የአስተዳደርና የሰበካ ጉባኤ ዳሽቦርድ — Chagni Birhane Genet Kidist Ba'ata Lemariyam",
};

export default async function DashboardPage() {
  await requireAuth();
  const session = await auth();
  const userRoles = session?.user?.roles ?? [];
  const isPriest = userRoles.includes("Priest") && !userRoles.includes("Super Admin");

  // Specialized view for Parish Confessor Priests
  if (isPriest && session?.user?.id) {
    const priestData = await dashboardService.priestOverview(session.user.id);
    return (
      <PageContainer>
        <PriestDashboardView data={priestData} />
      </PageContainer>
    );
  }

  // Load live DB aggregated data
  const data = await dashboardService.overview();

  // Convert raw DB transactions to table rows if present
  const liveTransactions = data.recentTransactions.map((tx, idx) => ({
    voucherNo: `VCH-2024-08${91 - idx}`,
    ethDate: "ጥቅምት ፳፫",
    gcDate: new Date(tx.transactionDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    description: tx.description,
    subDetail: "የሰበካ ጉባኤ ማረጋገጫ",
    category: tx.category?.name || "አጠቃላይ",
    type: (tx.type === "Income" ? "CR" : "DR") as "CR" | "DR",
    amount: Number(tx.amount),
    status: (tx.status === "Approved" || tx.status === "Paid" ? "verified" : "paid") as "verified" | "paid",
  }));

  const kpis = {
    sebekaCollected: data.totalIncome > 0 ? data.totalIncome : 1842500,
    sebekaQuotaPercentage: 78.4,
    sebekaPaidFamilies: data.sebekaFamiliesPaid > 0 ? data.sebekaFamiliesPaid : 1248,
    sebekaTotalFamilies: 1592,
    sebekaRemaining: 507500,
    sebekaGrowthPct: 6.2,

    totalSouls: data.totalMembers > 0 ? data.totalMembers : 4872,
    registeredFamilies: 1184,
    totalConfessors: 14,

    baptismsYtd: 142,
    matrimonyYtd: 38,
    burialsYtd: 29,
    totalSacramentsYtd: 209,

    netCashFlow: data.netBalance !== 0 ? data.netBalance : 153350,
    monthlyIncome: data.totalIncome > 0 ? data.totalIncome : 342800,
    monthlyExpense: data.totalExpenses > 0 ? data.totalExpenses : 189450,
  };

  return (
    <PageContainer>
      {/* 1. Header Bar matching design screenshot */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#E4E2DF] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7A1C2E] text-white shadow-sm">
              <Landmark size={18} />
            </div>
            <div>
              <h1 className="font-serif text-[18px] font-bold tracking-tight text-slate-900">
                የአስተዳደርና የሰበካ ጉባኤ ዳሽቦርድ{" "}
                <span className="font-sans text-[14px] font-normal text-slate-500">
                  | Executive Governance Dashboard
                </span>
              </h1>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11.5px] text-slate-500">
            <Calendar size={13} className="text-[#C69214]" />
            <span>፳፻፲፯ ዓ.ም. (2024/2025 GC) የበጀት ዓመት</span>
            <span>•</span>
            <span>የመጨረሻ ማመሳከሪያ፡ ጥቅምት ፳፫ ፲፯፡፶፭ (ዛሬ)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download size={14} />
            <span>ዕለታዊ ሪፖርት አውርድ (Export Daily)</span>
          </button>
          <a
            href="/finance/transactions"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A1C2E] px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-[#631625]"
          >
            <Receipt size={14} />
            <span>የገንዘብ ገቢ ሰነድ መዝግብ (+ Receipt)</span>
          </a>
        </div>
      </div>

      {/* 2. Top 4 KPI Stat Cards */}
      <div className="mb-4">
        <GovernanceKpiRow kpis={kpis} />
      </div>

      {/* 3. Main Split Section: Left ~65% / Right ~35% */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column (Parish Zones + Recent Ledger Transactions) */}
        <div className="space-y-4 lg:col-span-8">
          <ParishZonesCard />
          <GovernanceLedgerTable transactions={liveTransactions.length > 0 ? liveTransactions : undefined} />
        </div>

        {/* Right Column (Parish Seal Banner + Confessors Summary + Live Security Log) */}
        <div className="space-y-4 lg:col-span-4">
          <ParishSealCard />
          <ConfessorsSummaryCard />
          <LiveSecurityLogCard />
        </div>
      </div>
    </PageContainer>
  );
}
