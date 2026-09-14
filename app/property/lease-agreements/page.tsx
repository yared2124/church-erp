import type { Metadata } from "next";
import { FileText, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { PropertyTabs } from "@/components/properties/property-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { LeaseAgreementsTable } from "@/components/properties/lease-agreements-table";

export const metadata: Metadata = {
  title: "Lease Agreements — Birhane Genet St. Mary Church",
};

export default async function PropertyLeaseAgreementsPage() {
  await requireAuth();

  const [leases, activeCount, expiredCount, terminatedCount] = await Promise.all([
    prisma.leaseAgreement.findMany({
      include: {
        tenant: true,
        property: true,
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.leaseAgreement.count({ where: { status: "Active" } }),
    prisma.leaseAgreement.count({ where: { status: "Expired" } }),
    prisma.leaseAgreement.count({ where: { status: "Terminated" } }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Property & Rentals", href: "/property" },
          { label: "Lease Agreements" },
        ]}
        title="Lease Agreements"
        description="Contractual rental agreements between the church and tenants"
      />

      <PropertyTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Agreements" value={String(activeCount)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Expired" value={String(expiredCount)} icon={AlertCircle} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Terminated" value={String(terminatedCount)} icon={XCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
      </div>

      <LeaseAgreementsTable leases={JSON.parse(JSON.stringify(leases))} />
    </PageContainer>
  );
}
