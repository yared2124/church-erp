import type { Metadata } from "next";
import { Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";
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
  title: "Asset Maintenance — Birhane Genet St. Mary Church",
};

export default async function InventoryMaintenancePage() {
  await requireAuth();

  const lowStockItems = await prisma.inventoryItem.findMany({
    where: {
      OR: [{ status: "LowStock" }, { status: "OutOfStock" }],
    },
    include: { category: true },
    orderBy: { quantity: "asc" },
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets & Inventory", href: "/inventory" },
          { label: "Maintenance" },
        ]}
        title="Asset Maintenance & Replenishment"
        description="Tracking maintenance needs, damaged equipment, and low-stock items requiring replenishment"
      />

      <InventoryTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Items Requiring Replenishment" value={String(lowStockItems.length)} icon={AlertTriangle} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Out of Stock Items" value={String(lowStockItems.filter(i => i.status === "OutOfStock").length)} icon={Wrench} iconBg="bg-danger-bg" iconColor="text-danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Replenishment & Maintenance Needs</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-text-muted">All inventory items are well-stocked.</TableCell>
                </TableRow>
              ) : (
                lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-text-primary">{item.name}</TableCell>
                    <TableCell className="text-text-secondary">{item.category.name}</TableCell>
                    <TableCell className="font-bold text-danger">{item.quantity} units</TableCell>
                    <TableCell>
                      <Badge tone={item.status === "OutOfStock" ? "danger" : "warning"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-text-primary">{Number(item.unitPrice).toLocaleString()} ETB</TableCell>
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
