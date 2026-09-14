import type { Metadata } from "next";
import { AlertCircle, Users, DollarSign, Home } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { PropertyTabs } from "@/components/properties/property-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { OverdueRentalsTable } from "@/components/properties/overdue-rentals-table";

export const metadata: Metadata = {
  title: "Overdue Rentals — Birhane Genet St. Mary Church",
};

export default async function OverdueRentalsPage() {
  await requireAuth();

  const overduePayments = await prisma.rentPayment.findMany({
    where: { status: "Overdue" },
    include: {
      leaseAgreement: {
        include: {
          tenant: true,
          property: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalOverdue = overduePayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const uniqueTenants = new Set(overduePayments.map(p => p.leaseAgreement?.tenantId)).size;
  const uniqueProperties = new Set(overduePayments.map(p => p.leaseAgreement?.propertyId)).size;

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Property & Rentals", href: "/property" },
          { label: "Overdue Rentals" },
        ]}
        title="Overdue Rentals"
        description="Tenants and properties with pending or delinquent rental payments"
      />

      <PropertyTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Overdue Amount" value={totalOverdue.toLocaleString()} suffix="ETB" icon={AlertCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Tenants in Arrears" value={String(uniqueTenants)} icon={Users} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Affected Units" value={String(uniqueProperties)} icon={Home} iconBg="bg-gold-light" iconColor="text-gold" />
      </div>

      <OverdueRentalsTable overduePayments={JSON.parse(JSON.stringify(overduePayments))} />
    </PageContainer>
  );
}
