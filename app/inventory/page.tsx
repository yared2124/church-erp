import type { Metadata } from "next";
import { Boxes, PackageCheck, AlertTriangle, DollarSign, Truck, Download, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { AssetsByCategoryCard, StockStatusCard } from "@/components/inventory/inventory-charts";
import { InventoryQuickActions, LowStockAlertsCard, RecentStockMovementsCard } from "@/components/inventory/inventory-panels";
import { requireAuth } from "@/lib/api-helpers";
import { inventoryService } from "@/features/inventory/inventory.service";

export const metadata: Metadata = {
  title: "Assets & Inventory — Birhane Genet St. Mary Church",
};

export default async function InventoryOverviewPage() {
  await requireAuth();
  const s = await inventoryService.overview();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets & Inventory", href: "/inventory" },
          { label: "Inventory" },
        ]}
        title="Assets & Inventory"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
            <Button icon={<Plus size={16} />}>Add New Item</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Items" value={s.totalItems.toLocaleString()} icon={Boxes} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Items In Stock" value={s.inStock.toLocaleString()} icon={PackageCheck} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Low Stock Items" value={String(s.lowStock)} icon={AlertTriangle} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Total Value" value={s.totalValue.toLocaleString()} suffix="ETB" icon={DollarSign} iconBg="bg-info-bg" iconColor="text-info" />
        <StatCard label="Active Suppliers" value={String(s.activeSuppliers)} icon={Truck} iconBg="bg-primary-light" iconColor="text-primary" />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <AssetsByCategoryCard data={s.byCategory} />
        <StockStatusCard inStock={s.inStock} lowStock={s.lowStock} outOfStock={s.outOfStock} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Inventory Items</CardTitle>
            </CardHeader>
            <InventoryTable />
          </Card>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-4">
          <InventoryQuickActions />
          <LowStockAlertsCard items={s.lowStockAlerts} />
          <RecentStockMovementsCard movements={s.recentStockMovements} />
        </div>
      </div>
    </PageContainer>
  );
}
