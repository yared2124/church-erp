import type { Metadata } from "next";
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Stock Movements — Birhane Genet St. Mary Church",
};

export default async function StockMovementsPage() {
  await requireAuth();

  const movements = await prisma.stockMovement.findMany({
    include: {
      item: { include: { category: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const inCount = movements.filter(m => m.movementType === "In").length;
  const outCount = movements.filter(m => m.movementType === "Out").length;

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets & Inventory", href: "/inventory" },
          { label: "Stock Movements" },
        ]}
        title="Stock Movements & Audit Trail"
        description="Historical log of all inventory additions, withdrawals, and adjustments"
      />

      <InventoryTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Movements" value={String(movements.length)} icon={ArrowLeftRight} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Stock Inflow (In)" value={String(inCount)} icon={ArrowDownLeft} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Stock Outflow (Out)" value={String(outCount)} icon={ArrowUpRight} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movement Records</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Movement Type</TableHead>
                <TableHead>Quantity Changed</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-text-muted">No stock movement entries recorded yet.</TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-semibold text-text-primary">{m.item.name}</TableCell>
                    <TableCell className="text-text-secondary">{m.item.category.name}</TableCell>
                    <TableCell>
                      <Badge tone={m.movementType === "In" ? "success" : "warning"}>
                        {m.movementType === "In" ? "Stock In (ገቢ)" : "Stock Out (ወጪ)"}
                      </Badge>
                    </TableCell>
                    <TableCell className={m.movementType === "In" ? "font-bold text-success" : "font-bold text-warning"}>
                      {m.movementType === "In" ? `+${m.changeQty}` : `-${m.changeQty}`}
                    </TableCell>
                    <TableCell className="text-text-secondary">{m.reason ?? "Adjustment"}</TableCell>
                    <TableCell className="text-text-secondary">{m.createdBy?.name ?? "Staff"}</TableCell>
                    <TableCell className="text-right text-text-secondary">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
