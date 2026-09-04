import type { Metadata } from "next";
import { FileBarChart2, TrendingUp, PiggyBank, Home } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinanceTabs } from "@/components/finance/finance-tabs";

const REPORTS = [
  { title: "Monthly Income Statement", description: "Detailed income and revenue summary for the selected period.", icon: TrendingUp },
  { title: "Expense Breakdown Report", description: "Category-by-category breakdown of all recorded expenses.", icon: FileBarChart2 },
  { title: "Sebeka Collection Report", description: "Family-by-family Sebeka Gubae payment status and totals.", icon: PiggyBank },
  { title: "Cash Flow Report", description: "Detailed cash inflow and outflow analysis by month.", icon: Home },
];

export const metadata: Metadata = {
  title: "Financial Reports — Birhane Genet St. Mary Church",
};

export default function FinanceReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Financial Management", href: "/finance" },
          { label: "Reports" },
        ]}
        title="Financial Management"
      />

      <FinanceTabs />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-light">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle>{r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Button variant="secondary" size="sm">
                Generate Report
              </Button>
            </Card>
          );
        })}
      </div>

      <p className="mt-5 text-small text-text-secondary">
        Full report scheduling, export formats, and history live in the Reports &amp; Analytics
        module — this tab surfaces the financial reports most people need without leaving
        Financial Management.
      </p>
    </PageContainer>
  );
}
