import type { Metadata } from "next";
import { Boxes, PackageCheck, AlertTriangle, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Inventory Items — Birhane Genet St. Mary Church",
};

export default async function InventoryItemsPage() {
  await requireAuth();

  const [totalItems, inStock, lowStock] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.count({ where: { status: "InStock" } }),
    prisma.inventoryItem.count({ where: { status: "LowStock" } }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets & Inventory", href: "/inventory" },
          { label: "Items" },
        ]}
        title="Inventory Items & Church Assets"
        description="Search, view, and manage all sacred and administrative inventory items"
      />

      <InventoryTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Items" value={String(totalItems)} icon={Boxes} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="In Stock" value={String(inStock)} icon={PackageCheck} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Low Stock Alert" value={String(lowStock)} icon={AlertTriangle} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <InventoryTable />
      </Card>
    </PageContainer>
  );
}
