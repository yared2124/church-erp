import type { Metadata } from "next";
import { Cross, Heart, BookOpen, Download, Printer } from "lucide-react";
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
  title: "Sacraments Report — Birhane Genet St. Mary Church",
};

export default async function SacramentsReportPage() {
  await requireAuth();

  const [baptisms, marriages, burials, total] = await Promise.all([
    prisma.sacrament.count({ where: { type: "Baptism" } }),
    prisma.sacrament.count({ where: { type: "Marriage" } }),
    prisma.sacrament.count({ where: { type: "Burial" } }),
    prisma.sacrament.count(),
  ]);

  const recent = await prisma.sacrament.findMany({
    include: {
      primaryMember: true,
      priest: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports & Analytics", href: "/reports" },
          { label: "Sacraments" },
        ]}
        title="Holy Sacraments & Liturgical Report"
        description="Comprehensive summary of Baptisms, Holy Matrimonies, and Burials officiated"
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
        <StatCard label="Total Sacraments" value={String(total)} icon={Cross} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Baptisms (ጥምቀት)" value={String(baptisms)} icon={BookOpen} iconBg="bg-gold-light" iconColor="text-gold" />
        <StatCard label="Marriages (ተክሊል)" value={String(marriages)} icon={Heart} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Burials (ፍትሐት)" value={String(burials)} icon={Cross} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Officiated Sacraments Register</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Primary Member</TableHead>
                <TableHead>Officiating Priest</TableHead>
                <TableHead>Officiated Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold text-text-primary">{s.type}</TableCell>
                  <TableCell className="text-text-secondary">{s.primaryMember.firstName} {s.primaryMember.lastName}</TableCell>
                  <TableCell className="text-text-secondary">{s.priest?.name ?? "Priest"}</TableCell>
                  <TableCell className="text-text-secondary">{new Date(s.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right text-success font-medium">{s.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
