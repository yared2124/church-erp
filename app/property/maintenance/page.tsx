import type { Metadata } from "next";
import { Wrench, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { PropertyTabs } from "@/components/properties/property-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { PropertyMaintenanceTable } from "@/components/properties/property-maintenance-table";

export const metadata: Metadata = {
  title: "Property Maintenance — Birhane Genet St. Mary Church",
};

export default async function PropertyMaintenancePage() {
  await requireAuth();

  const [requests, scheduledCount, inProgressCount, completedCount, urgentCount] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      include: { property: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.maintenanceRequest.count({ where: { status: "Scheduled" } }),
    prisma.maintenanceRequest.count({ where: { status: "InProgress" } }),
    prisma.maintenanceRequest.count({ where: { status: "Completed" } }),
    prisma.maintenanceRequest.count({ where: { priority: "Urgent" } }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Property & Rentals", href: "/property" },
          { label: "Maintenance" },
        ]}
        title="Property Maintenance"
        description="Repairs, work orders, and service requests for church units"
      />

      <PropertyTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Scheduled" value={String(scheduledCount)} icon={Clock} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="In Progress" value={String(inProgressCount)} icon={Wrench} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Completed" value={String(completedCount)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Urgent Priority" value={String(urgentCount)} icon={AlertTriangle} iconBg="bg-danger-bg" iconColor="text-danger" />
      </div>

      <PropertyMaintenanceTable requests={JSON.parse(JSON.stringify(requests))} />
    </PageContainer>
  );
}
