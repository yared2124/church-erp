import type { Metadata } from "next";
import { Building2, Home, CheckCircle2, AlertCircle, Download, Printer } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ReportTabs } from "@/components/reports/report-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Property Report — Birhane Genet St. Mary Church",
};

export default async function PropertyReportPage() {
  await requireAuth();

  const [totalUnits, occupiedUnits, totalIncomeSum, overdueSum] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "Occupied" } }),
    prisma.rentPayment.aggregate({ where: { status: "Paid" }, _sum: { amount: true } }),
    prisma.rentPayment.aggregate({ where: { status: "Overdue" }, _sum: { amount: true } }),
  ]);

  const properties = await prisma.property.findMany({
    include: {
      leaseAgreements: { where: { status: "Active" }, include: { tenant: true }, take: 1 },
    },
    orderBy: { unitName: "asc" },
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports & Analytics", href: "/reports" },
          { label: "Property" },
        ]}
        title="Church Property & Rental Yield Report"
        description="Comprehensive property occupancy, rental revenue collection, and delinquency report"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Printer size={15} />}>Print</Button>
            <Button variant="secondary" icon={<Download size={15} />}>Export PDF</Button>
            <Button icon={<Download size={15} />}>Export Excel</Button>
          </div>
        }
      />

      <ReportTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Properties" value={String(totalUnits)} icon={Building2} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Occupied Units" value={String(occupiedUnits)} icon={Home} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Total Rental Yield (Paid)" value={(Number(totalIncomeSum._sum.amount) || 0).toLocaleString()} suffix="ETB" icon={CheckCircle2} iconBg="bg-gold-light" iconColor="text-gold" />
        <StatCard label="Total Delinquent (Overdue)" value={(Number(overdueSum._sum.amount) || 0).toLocaleString()} suffix="ETB" icon={AlertCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties & Tenant Yield Roster</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Unit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Current Tenant</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead className="text-right">Occupancy Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-text-primary">{p.unitName}</TableCell>
                  <TableCell className="text-text-secondary">{p.type}</TableCell>
                  <TableCell className="text-text-secondary">{p.leaseAgreements[0]?.tenant?.name ?? "— (Vacant)"}</TableCell>
                  <TableCell className="font-bold text-success">{Number(p.monthlyRent).toLocaleString()} ETB</TableCell>
                  <TableCell className={p.status === "Occupied" ? "text-right font-semibold text-success" : "text-right text-text-muted"}>
                    {p.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
