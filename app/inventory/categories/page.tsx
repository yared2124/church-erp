import type { Metadata } from "next";
import { Layers, Boxes, DollarSign } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Inventory Categories — Birhane Genet St. Mary Church",
};

export default async function InventoryCategoriesPage() {
  await requireAuth();

  const categories = await prisma.inventoryCategory.findMany({
    include: {
      items: {
        select: { quantity: true, unitPrice: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets & Inventory", href: "/inventory" },
          { label: "Categories" },
        ]}
        title="Inventory Categories"
        description="Classification of church assets, sacramental items, and office supplies"
      />

      <InventoryTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Categories" value={String(categories.length)} icon={Layers} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Categorized Items" value={String(totalItems)} icon={Boxes} iconBg="bg-gold-light" iconColor="text-gold" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Categories</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Total Item Types</TableHead>
                <TableHead>Total Stock Quantity</TableHead>
                <TableHead className="text-right">Estimated Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => {
                const totalQty = c.items.reduce((s, i) => s + i.quantity, 0);
                const totalVal = c.items.reduce((s, i) => s + (i.quantity * Number(i.unitPrice)), 0);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-text-primary">{c.name}</TableCell>
                    <TableCell className="text-text-secondary">{c.items.length} items</TableCell>
                    <TableCell className="font-medium text-text-primary">{totalQty.toLocaleString()} units</TableCell>
                    <TableCell className="text-right font-bold text-success">{totalVal.toLocaleString()} ETB</TableCell>
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
