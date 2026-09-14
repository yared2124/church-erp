import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Wallet, Download, Printer, DollarSign } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ReportTabs } from "@/components/reports/report-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Financial Report — Birhane Genet St. Mary Church",
};

export default async function FinancialReportPage() {
  await requireAuth();

  const [incomeSum, expenseSum, sebekaSum] = await Promise.all([
    prisma.transaction.aggregate({ where: { type: "Income", status: "Paid" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "Expense", status: "Paid" }, _sum: { amount: true } }),
    prisma.familyPayment.aggregate({ _sum: { paidAmount: true } }),
  ]);

  const categories = await prisma.transactionCategory.findMany({
    include: { transactions: { where: { status: "Paid" }, select: { amount: true } } },
    orderBy: { name: "asc" },
  });

  const totalIncome = Number(incomeSum._sum?.amount ?? 0);
  const totalExpense = Number(expenseSum._sum?.amount ?? 0);
  const netSurplus = totalIncome - totalExpense;
  const totalSebeka = Number(sebekaSum._sum?.paidAmount ?? 0);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports & Analytics", href: "/reports" },
          { label: "Financial" },
        ]}
        title="Financial Statement & Revenue Reports"
        description="Comprehensive accounting ledger, income vs expenditure balance, and Sebeka contributions"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Printer size={15} />}>Print</Button>
            <Button variant="secondary" icon={<Download size={15} />}>Export PDF</Button>
            <Button icon={<Download size={15} />}>Export Excel</Button>
          </div>
        }
      />

      <ReportTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Church Income" value={totalIncome.toLocaleString()} suffix="ETB" icon={TrendingUp} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Total Expenditures" value={totalExpense.toLocaleString()} suffix="ETB" icon={TrendingDown} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Net Operating Balance" value={netSurplus.toLocaleString()} suffix="ETB" icon={DollarSign} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Total Sebeka Collected" value={totalSebeka.toLocaleString()} suffix="ETB" icon={Wallet} iconBg="bg-gold-light" iconColor="text-gold" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income & Expense Category Breakdown</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Transactions Count</TableHead>
                <TableHead className="text-right">Total Amount (ETB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => {
                const total = c.transactions.reduce((s: number, t: { amount: unknown }) => s + Number(t.amount), 0);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-text-primary">{c.name}</TableCell>
                    <TableCell className={c.type === "Income" ? "font-medium text-success" : "font-medium text-danger"}>{c.type}</TableCell>
                    <TableCell className="text-text-secondary">{c.transactions.length}</TableCell>
                    <TableCell className={c.type === "Income" ? "text-right font-bold text-success" : "text-right font-bold text-danger"}>
                      {c.type === "Income" ? "+" + total.toLocaleString() : "-" + total.toLocaleString()} ETB
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
