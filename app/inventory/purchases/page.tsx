import type { Metadata } from "next";
import { ShoppingCart, PackagePlus, Calendar } from "lucide-react";
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
  title: "Purchases — Birhane Genet St. Mary Church",
};

export default async function InventoryPurchasesPage() {
  await requireAuth();

  const movements = await prisma.stockMovement.findMany({
    where: { movementType: "In" },
    include: {
      item: { include: { category: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalInQty = movements.reduce((s, m) => s + m.changeQty, 0);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets & Inventory", href: "/inventory" },
          { label: "Purchases" },
        ]}
        title="Stock Purchases & Inflows"
        description="Records of purchased or donated supplies and items received into church inventory"
      />

      <InventoryTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Inbound Transactions" value={String(movements.length)} icon={ShoppingCart} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Total Units Received" value={totalInQty.toLocaleString()} icon={PackagePlus} iconBg="bg-success-bg" iconColor="text-success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbound Purchases Log</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity Received</TableHead>
                <TableHead>Reason / Source</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-text-muted">No purchase records found.</TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-semibold text-text-primary">{m.item.name}</TableCell>
                    <TableCell className="text-text-secondary">{m.item.category.name}</TableCell>
                    <TableCell className="font-bold text-success">+{m.changeQty}</TableCell>
                    <TableCell className="text-text-secondary">{m.reason ?? "Purchase"}</TableCell>
                    <TableCell className="text-text-secondary">{m.createdBy?.name ?? "Admin"}</TableCell>
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
