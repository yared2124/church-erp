import { Download, PlusCircle, MinusCircle, PiggyBank, Home, ListChecks, FileBarChart2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FinanceOverviewResponse } from "@/features/finance/finance.types";

interface FinancialOverviewPanelProps {
  overview: FinanceOverviewResponse;
  unpaidSebekaFamilies: number;
}

export function FinancialOverviewPanel({ overview: f, unpaidSebekaFamilies }: FinancialOverviewPanelProps) {
  return (
    <Card className="xl:col-span-6">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <button aria-label="More options" className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
          <MoreVertical size={16} />
        </button>
      </CardHeader>
      <div className="flex flex-col gap-3 text-[13.5px]">
        <Row label="Opening Balance" value={`${f.openingBalance.toLocaleString()} ETB`} />
        <Row label="Total Income" value={`${f.totalIncome.toLocaleString()} ETB`} valueClass="text-success" />
        <Row label="Total Expenses" value={`${f.totalExpenses.toLocaleString()} ETB`} valueClass="text-danger" />
        <Row label="Net Balance" value={`${f.netBalance.toLocaleString()} ETB`} valueClass="text-primary" />
        <Row label="This Month Collections" value={`${f.thisMonthCollections.toLocaleString()} ETB`} />
        <Row label="Unpaid Sebeka Families" value={`${unpaidSebekaFamilies} Families`} valueClass="text-warning" />
      </div>
      <Button variant="secondary" icon={<Download size={16} />} className="mt-5 w-full">
        Download Financial Summary
      </Button>
    </Card>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-light pb-3 last:border-0 last:pb-0">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-semibold text-text-primary ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Add Income", icon: PlusCircle, href: "/finance/income" },
  { label: "Add Expense", icon: MinusCircle, href: "/finance/expenses" },
  { label: "Add Sebeka Payment", icon: PiggyBank, href: "/finance/sebeka-payments" },
  { label: "Record Rent Payment", icon: Home, href: "/property/rent-payments" },
  { label: "View All Transactions", icon: ListChecks, href: "/finance/transactions" },
  { label: "Generate Financial Report", icon: FileBarChart2, href: "/finance/reports" },
];

export function FinanceQuickActions() {
  return (
    <Card className="xl:col-span-6">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex h-11 items-center justify-between rounded-md border border-border px-3.5 text-[13.5px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt"
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} className="text-primary" />
                {a.label}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
