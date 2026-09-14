import type { Metadata } from "next";
import { Tag, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Transaction Categories — Birhane Genet St. Mary Church",
};

export default async function FinanceCategoriesPage() {
  await requireAuth();

  const categories = await prisma.transactionCategory.findMany({
    include: {
      transactions: {
        select: { amount: true },
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const incomeCategories = categories.filter((c) => c.type === "Income");
  const expenseCategories = categories.filter((c) => c.type === "Expense");

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Financial Management", href: "/finance" },
          { label: "Categories" },
        ]}
        title="Transaction Categories"
        description="Categorization of all church revenue inflows and expenditure outflows"
      />

      <FinanceTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Categories" value={String(categories.length)} icon={Layers} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Income Categories" value={String(incomeCategories.length)} icon={TrendingUp} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Expense Categories" value={String(expenseCategories.length)} icon={TrendingDown} iconBg="bg-danger-bg" iconColor="text-danger" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-success" />
              <CardTitle>Income Categories (የገቢ አርዕስቶች)</CardTitle>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead className="text-right">Total Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeCategories.map((c) => {
                  const total = c.transactions.reduce((s, t) => s + Number(t.amount), 0);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-text-primary">{c.name}</TableCell>
                      <TableCell><Badge tone="success">Income</Badge></TableCell>
                      <TableCell className="text-text-secondary">{c.transactions.length}</TableCell>
                      <TableCell className="text-right font-bold text-success">+{total.toLocaleString()} ETB</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown size={18} className="text-danger" />
              <CardTitle>Expense Categories (የወጪ አርዕስቶች)</CardTitle>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead className="text-right">Total Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseCategories.map((c) => {
                  const total = c.transactions.reduce((s, t) => s + Number(t.amount), 0);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-text-primary">{c.name}</TableCell>
                      <TableCell><Badge tone="danger">Expense</Badge></TableCell>
                      <TableCell className="text-text-secondary">{c.transactions.length}</TableCell>
                      <TableCell className="text-right font-bold text-danger">-{total.toLocaleString()} ETB</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
