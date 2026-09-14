import type { Metadata } from "next";
import { Wallet, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { PropertyTabs } from "@/components/properties/property-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { RentPaymentsTable } from "@/components/properties/rent-payments-table";

export const metadata: Metadata = {
  title: "Rent Payments — Birhane Genet St. Mary Church",
};

export default async function PropertyRentPaymentsPage() {
  await requireAuth();

  const [payments, paidSum, pendingSum, overdueSum] = await Promise.all([
    prisma.rentPayment.findMany({
      include: {
        leaseAgreement: {
          include: {
            tenant: true,
            property: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.rentPayment.aggregate({
      where: { status: "Paid" },
      _sum: { amount: true },
    }),
    prisma.rentPayment.aggregate({
      where: { status: "Pending" },
      _sum: { amount: true },
    }),
    prisma.rentPayment.aggregate({
      where: { status: "Overdue" },
      _sum: { amount: true },
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Property & Rentals", href: "/property" },
          { label: "Rent Payments" },
        ]}
        title="Rent Payments"
        description="Track all monthly rent collections, receipts, and payment statuses"
      />

      <PropertyTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Collected (Paid)" value={(Number(paidSum._sum.amount) || 0).toLocaleString()} suffix="ETB" icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Pending Payments" value={(Number(pendingSum._sum.amount) || 0).toLocaleString()} suffix="ETB" icon={Clock} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Overdue Amount" value={(Number(overdueSum._sum.amount) || 0).toLocaleString()} suffix="ETB" icon={AlertCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
      </div>

      <RentPaymentsTable payments={JSON.parse(JSON.stringify(payments))} />
    </PageContainer>
  );
}
