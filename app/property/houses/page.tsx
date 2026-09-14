import type { Metadata } from "next";
import { Home, CheckCircle2, XCircle, DollarSign, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { PropertyTabs } from "@/components/properties/property-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { HousesTable } from "@/components/properties/houses-table";

export const metadata: Metadata = {
  title: "Houses & Properties — Birhane Genet St. Mary Church",
};

export default async function PropertyHousesPage() {
  await requireAuth();

  const [properties, totalCount, occupiedCount, vacantCount] = await Promise.all([
    prisma.property.findMany({
      include: {
        leaseAgreements: {
          where: { status: "Active" },
          include: { tenant: true },
          take: 1,
        },
      },
      orderBy: { unitName: "asc" },
    }),
    prisma.property.count(),
    prisma.property.count({ where: { status: "Occupied" } }),
    prisma.property.count({ where: { status: "Vacant" } }),
  ]);

  const totalRent = properties.reduce((sum, p) => sum + Number(p.monthlyRent), 0);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Property & Rentals", href: "/property" },
          { label: "Houses" },
        ]}
        title="Church Houses & Units"
        description="Manage all church residential, commercial, and hall rental units"
      />

      <PropertyTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Units" value={String(totalCount)} icon={Home} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Occupied" value={String(occupiedCount)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Vacant" value={String(vacantCount)} icon={XCircle} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Total Monthly Rent Value" value={totalRent.toLocaleString()} suffix="ETB" icon={DollarSign} iconBg="bg-gold-light" iconColor="text-gold" />
      </div>

      <HousesTable properties={JSON.parse(JSON.stringify(properties))} />
    </PageContainer>
  );
}
