import type { Metadata } from "next";
import { Boxes, PackageCheck, AlertTriangle, DollarSign, Download, Printer } from "lucide-react";
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
  title: "Inventory Report — Birhane Genet St. Mary Church",
};

export default async function InventoryReportPage() {
  await requireAuth();

  const [totalItems, lowStockCount, categories] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.count({ where: { OR: [{ status: "LowStock" }, { status: "OutOfStock" }] } }),
    prisma.inventoryCategory.findMany({
      include: { items: true },
      orderBy: { name: "asc" },
    }),
  ]);

  let totalVal = 0;
  categories.forEach(c => {
    c.items.forEach(i => {
      totalVal += i.quantity * Number(i.unitPrice);
    });
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports & Analytics", href: "/reports" },
          { label: "Inventory" },
        ]}
        title="Asset Valuation & Stock Report"
        description="Comprehensive valuation of sacred vessels, vestments, furnishings, and equipment"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Printer size={15} />}>Print</Button>
            <Button variant="secondary" icon={<Download size={15} />}>Export PDF</Button>
            <Button icon={<Download size={15} />}>Export Excel</Button>
          </div>
        }
      />

      <ReportTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Distinct Item Types" value={String(totalItems)} icon={Boxes} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Estimated Total Asset Value" value={totalVal.toLocaleString()} suffix="ETB" icon={DollarSign} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Replenishment Alerts" value={String(lowStockCount)} icon={AlertTriangle} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Valuation by Category</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Total Item Types</TableHead>
                <TableHead>Total Quantity</TableHead>
                <TableHead className="text-right">Estimated Valuation (ETB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => {
                const totalQty = c.items.reduce((s, i) => s + i.quantity, 0);
                const catVal = c.items.reduce((s, i) => s + (i.quantity * Number(i.unitPrice)), 0);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-text-primary">{c.name}</TableCell>
                    <TableCell className="text-text-secondary">{c.items.length}</TableCell>
                    <TableCell className="font-medium text-text-primary">{totalQty.toLocaleString()} units</TableCell>
                    <TableCell className="text-right font-bold text-success">{catVal.toLocaleString()} ETB</TableCell>
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
