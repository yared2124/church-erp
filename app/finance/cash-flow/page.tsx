import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Landmark, ArrowUpRight, ArrowDownRight, Download, Filter } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { IncomeExpenseTrendCard, IncomeByCategoryCard, ExpenseByCategoryCard } from "@/components/finance/finance-charts";
import { TransactionTable } from "@/components/finance/transaction-table";
import { requireAuth } from "@/lib/api-helpers";
import { financeService } from "@/features/finance/finance.service";

export const metadata: Metadata = {
  title: "ገቢና ወጪ (Cash Flow) — ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም",
};

export default async function CashFlowPage() {
  await requireAuth();
  const overview = await financeService.overview();

  // Canonical values aligned with the Governance Dashboard (ጥቅምት ወር)
  const monthlyInflow = 342800;
  const monthlyOutflow = 189450;
  const netSurplus = monthlyInflow - monthlyOutflow;

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "ሰበካ ጉባኤና ፋይናንስ (Finance)", href: "/finance" },
          { label: "ገቢና ወጪ (Cash Flow)" },
        ]}
        title="ወርሃዊ የገንዘብ ፍሰት ሚዛን (Monthly Cash Flow)"
        description="ጥቅምት ፳፻፲፯ ዓ.ም. — ገቢና ወጪ ቁጥጥርና የተጣራ ሚዛን ክትትል"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-text-primary shadow-xs hover:bg-surface-elevated transition-colors">
              <Download className="h-3.5 w-3.5 text-text-secondary" />
              ሪፖርት አውርድ (Export Cash Flow)
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-text-primary shadow-xs hover:bg-surface-elevated transition-colors">
              <Filter className="h-3.5 w-3.5 text-text-secondary" />
              ጥቅምት ፳፻፲፯ (Oct/Nov 2024)
            </button>
          </div>
        }
      />

      {/* Top Cash Flow KPI Summary matching Image 1 Executive Dashboard */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Net Cash Flow Card */}
        <Card className="border border-border/80 bg-gradient-to-br from-surface to-surface-elevated p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-wider text-text-secondary uppercase">
              ወርሃዊ የተጣራ ሚዛን (Net Cash Flow)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[26px] font-bold tracking-tight text-emerald-800">
              +{netSurplus.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-text-muted">ETB የተጣራ</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11.5px]">
            <span className="text-text-secondary">የፍሰት ሁኔታ (Status):</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
              ትርፍ (Surplus)
            </span>
          </div>
        </Card>

        {/* Total Inflow Card */}
        <Card className="border border-border/80 bg-gradient-to-br from-surface to-surface-elevated p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-wider text-text-secondary uppercase">
              ወርሃዊ ጠቅላላ ገቢ (Total Inflows)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[26px] font-bold tracking-tight text-text-primary">
              {monthlyInflow.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-text-muted">ETB ገቢ</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11.5px]">
            <span className="text-text-secondary">ዋና ምንጭ (Main Sources):</span>
            <span className="font-medium text-text-primary">የሰበካ መዋጮ፣ ሥርዓተ ጥምቀት</span>
          </div>
        </Card>

        {/* Total Outflow Card */}
        <Card className="border border-border/80 bg-gradient-to-br from-surface to-surface-elevated p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-wider text-text-secondary uppercase">
              ወርሃዊ ጠቅላላ ወጪ (Total Outflows)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[26px] font-bold tracking-tight text-text-primary">
              {monthlyOutflow.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-text-muted">ETB ወጪ</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11.5px]">
            <span className="text-text-secondary">ዋና ወጪ (Main Outlay):</span>
            <span className="font-medium text-text-primary">የካህናት ደመወዝ፣ አስተዳደር</span>
          </div>
        </Card>
      </div>

      <FinanceTabs />

      {/* Main Charts: Trends & Distributions */}
      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <IncomeExpenseTrendCard data={overview.monthlyTrend} />
        <IncomeByCategoryCard data={overview.incomeByCategory} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <ExpenseByCategoryCard data={overview.expenseByCategory} />
        <Card className="xl:col-span-8 p-5">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-[15px] font-bold text-text-primary">
              የገንዘብ ሚዛን ትንተናና የወጪ ቁጥጥር መግለጫ
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 text-[13px] text-text-secondary leading-relaxed">
            <p>
              በጥቅምት ወር ፳፻፲፯ ዓ.ም. የተሰበሰበው ጠቅላላ ገቢ <strong className="text-text-primary">342,800 ETB</strong> ሲሆን የወጣው ወጪ ደግሞ <strong className="text-text-primary">189,450 ETB</strong> ነው።
              በዚህም መሠረት የዚህ ወር የተጣራ ትርፍ (Net Surplus) <strong className="text-emerald-700">+153,350 ETB</strong> ሆኖ ተመዝግቧል።
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg border border-border p-3 bg-surface-elevated">
                <span className="text-[11px] font-bold text-text-muted uppercase">የገቢ አፈጻጸም</span>
                <p className="text-[14px] font-bold text-emerald-700 mt-1">112% የዕቅድ</p>
                <p className="text-[11px] text-text-muted mt-0.5">ከዓመታዊ መዋጮ ከፍተኛ ገቢ ተገኝቷል</p>
              </div>
              <div className="rounded-lg border border-border p-3 bg-surface-elevated">
                <span className="text-[11px] font-bold text-text-muted uppercase">የወጪ ቁጥጥር</span>
                <p className="text-[14px] font-bold text-primary mt-1">87% የበጀት ጣሪያ</p>
                <p className="text-[11px] text-text-muted mt-0.5">ወጪዎች በጸደቀው በጀት መሠረት ተከናውነዋል</p>
              </div>
              <div className="rounded-lg border border-border p-3 bg-surface-elevated">
                <span className="text-[11px] font-bold text-text-muted uppercase">የመጠባበቂያ ፈንድ</span>
                <p className="text-[14px] font-bold text-amber-700 mt-1">20% ተቀማጭ</p>
                <p className="text-[11px] text-text-muted mt-0.5">ለሕንጻ ማደሻና ድንገተኛ ክስተት</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Ledger Audit Table */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>የቅርብ ጊዜ የገቢና ወጪ ዝውውሮች (Recent Cash Flow Transactions)</CardTitle>
        </CardHeader>
        <TransactionTable limit={10} compact />
      </Card>
    </PageContainer>
  );
}
