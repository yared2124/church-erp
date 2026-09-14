import type { Metadata } from "next";
import { CreditCard, Banknote, Building, Smartphone } from "lucide-react";
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
  title: "Payment Methods — Birhane Genet St. Mary Church",
};

export default async function FinancePaymentMethodsPage() {
  await requireAuth();

  const transactions = await prisma.transaction.findMany({
    where: { status: "Paid" },
    select: { amount: true, type: true, paymentMethod: true },
  });

  const cashTx = transactions.filter(t => t.paymentMethod === "Cash");
  const bankTx = transactions.filter(t => t.paymentMethod === "BankTransfer");
  const mobileTx = transactions.filter(t => t.paymentMethod === "MobileMoney");

  const cashIncome = cashTx.filter(t => t.type === "Income").reduce((s, t) => s + Number(t.amount), 0);
  const bankIncome = bankTx.filter(t => t.type === "Income").reduce((s, t) => s + Number(t.amount), 0);
  const mobileIncome = mobileTx.filter(t => t.type === "Income").reduce((s, t) => s + Number(t.amount), 0);

  const methods = [
    {
      name: "Cash (ጥሬ ገንዘብ)",
      type: "Physical Cashier Desk",
      icon: Banknote,
      txCount: cashTx.length,
      income: cashIncome,
      tone: "success" as const,
    },
    {
      name: "Bank Transfer (የባንክ ሂሳብ ዝውውር)",
      type: "Commercial Bank of Ethiopia / Awash Bank",
      icon: Building,
      txCount: bankTx.length,
      income: bankIncome,
      tone: "primary" as const,
    },
    {
      name: "Mobile Money (ቴሌብር / የሞባይል ክፍያ)",
      type: "Telebirr / CBE Birr",
      icon: Smartphone,
      txCount: mobileTx.length,
      income: mobileIncome,
      tone: "warning" as const,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Financial Management", href: "/finance" },
          { label: "Payment Methods" },
        ]}
        title="Payment Methods"
        description="Supported channels for receiving contributions, donations, and paying expenses"
      />

      <FinanceTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Cash Received" value={cashIncome.toLocaleString()} suffix="ETB" icon={Banknote} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Bank Received" value={bankIncome.toLocaleString()} suffix="ETB" icon={Building} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Mobile Money Received" value={mobileIncome.toLocaleString()} suffix="ETB" icon={Smartphone} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Payment Channels</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel / Method</TableHead>
                <TableHead>Description / Provider</TableHead>
                <TableHead>Total Completed Transactions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Inflow Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((m) => (
                <TableRow key={m.name}>
                  <TableCell className="font-semibold text-text-primary">
                    <div className="flex items-center gap-2">
                      <m.icon size={16} className="text-gold" />
                      <span>{m.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">{m.type}</TableCell>
                  <TableCell className="text-text-secondary">{m.txCount} transactions</TableCell>
                  <TableCell><Badge tone="success">Active</Badge></TableCell>
                  <TableCell className="text-right font-bold text-success">+{m.income.toLocaleString()} ETB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
