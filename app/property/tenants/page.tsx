import type { Metadata } from "next";
import { Users, UserCheck, Phone, Home } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { PropertyTabs } from "@/components/properties/property-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { TenantsTable } from "@/components/properties/tenants-table";

export const metadata: Metadata = {
  title: "Tenants — Birhane Genet St. Mary Church",
};

export default async function PropertyTenantsPage() {
  await requireAuth();

  const [tenants, totalCount, activeLeasesCount] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        leaseAgreements: {
          include: { property: true },
          orderBy: { startDate: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.tenant.count(),
    prisma.leaseAgreement.count({ where: { status: "Active" } }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Property & Rentals", href: "/property" },
          { label: "Tenants" },
        ]}
        title="Tenants Directory"
        description="All individuals and businesses leasing church properties"
      />

      <PropertyTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Tenants" value={String(totalCount)} icon={Users} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Active Leases" value={String(activeLeasesCount)} icon={UserCheck} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Direct Contacts" value={String(tenants.filter(t => t.phone).length)} icon={Phone} iconBg="bg-gold-light" iconColor="text-gold" />
      </div>

      <TenantsTable tenants={JSON.parse(JSON.stringify(tenants))} />
    </PageContainer>
  );
}
