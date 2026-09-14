import type { Metadata } from "next";
import { Truck, Phone, Mail, Building } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Suppliers — Birhane Genet St. Mary Church",
};

export default async function InventorySuppliersPage() {
  await requireAuth();

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets & Inventory", href: "/inventory" },
          { label: "Suppliers" },
        ]}
        title="Asset & Equipment Suppliers"
        description="Vendors providing sacramental vestments, books, maintenance materials, and supplies"
      />

      <InventoryTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Registered Suppliers" value={String(suppliers.length)} icon={Truck} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Verified Contacts" value={String(suppliers.filter(s => s.phone).length)} icon={Phone} iconBg="bg-success-bg" iconColor="text-success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-text-muted">No suppliers registered yet.</TableCell>
                </TableRow>
              ) : (
                suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-semibold text-text-primary">
                      <div className="flex items-center gap-2">
                        <Building size={15} className="text-gold" />
                        <span>{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{s.phone ?? "—"}</TableCell>
                    <TableCell className="text-text-secondary">{s.email ?? "—"}</TableCell>
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
