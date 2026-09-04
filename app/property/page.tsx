import type { Metadata } from "next";
import { Home, UserCheck2, Wallet2, AlertCircle, Users, Plus, Download } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { RentStatusOverviewCard, PropertiesByTypeCard } from "@/components/properties/property-charts";
import {
  RecentRentPaymentsCard,
  ActiveTenantsCard,
  OverdueRentalsCard,
  PropertyMaintenanceCard,
  UpcomingLeaseExpiryCard,
} from "@/components/properties/property-panels";
import { requireAuth } from "@/lib/api-helpers";
import { propertyService } from "@/features/properties/property.service";

export const metadata: Metadata = {
  title: "Property & Rentals — Birhane Genet St. Mary Church",
};

export default async function PropertyOverviewPage() {
  await requireAuth();
  const s = await propertyService.overview();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Property & Rentals", href: "/property" },
          { label: "Overview" },
        ]}
        title="Property & Rentals"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
            <Button icon={<Plus size={16} />}>Add House</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Houses" value={String(s.totalHouses)} icon={Home} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Occupied Houses" value={String(s.occupied)} trend={`${s.occupancyRate} occupancy rate`} direction="up" icon={UserCheck2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Monthly Rent Income" value={s.monthlyRentIncome.toLocaleString()} suffix="ETB" icon={Wallet2} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Overdue Amount" value={s.overdueAmount.toLocaleString()} suffix="ETB" icon={AlertCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Active Tenants" value={String(s.activeTenants)} icon={Users} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <RecentRentPaymentsCard payments={s.recentRentPayments} />
        <ActiveTenantsCard leases={s.activeLeases as unknown as Parameters<typeof ActiveTenantsCard>[0]["leases"]} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <RentStatusOverviewCard data={s.rentStatusOverview} />
        <PropertiesByTypeCard data={s.propertiesByType} />
        <PropertyMaintenanceCard maintenance={s.maintenance} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <OverdueRentalsCard overdue={s.overdueRentals} />
        </div>
        <div className="lg:col-span-6">
          <UpcomingLeaseExpiryCard leases={s.activeLeases as unknown as Parameters<typeof ActiveTenantsCard>[0]["leases"]} />
        </div>
      </div>
    </PageContainer>
  );
}
