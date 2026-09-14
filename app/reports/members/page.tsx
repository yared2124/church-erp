import type { Metadata } from "next";
import { Users, Home, CheckCircle2, UserCheck, Download, Printer } from "lucide-react";
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
  title: "Members Report — Birhane Genet St. Mary Church",
};

export default async function MembersReportPage() {
  await requireAuth();

  const [totalMembers, activeMembers, totalFamilies, maleCount, femaleCount] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "Active" } }),
    prisma.family.count(),
    prisma.member.count({ where: { gender: "Male" } }),
    prisma.member.count({ where: { gender: "Female" } }),
  ]);

  const families = await prisma.family.findMany({
    include: { _count: { select: { members: true } } },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports & Analytics", href: "/reports" },
          { label: "Members" },
        ]}
        title="Parishioner & Demographics Report"
        description="Parish membership distribution, gender demographics, and active families"
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
        <StatCard label="Total Registered Members" value={String(totalMembers)} icon={Users} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Active Parishioners" value={String(activeMembers)} icon={UserCheck} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Registered Families" value={String(totalFamilies)} icon={Home} iconBg="bg-gold-light" iconColor="text-gold" />
        <StatCard label="Gender (Male / Female)" value={maleCount + " / " + femaleCount} icon={Users} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Family Membership Roster</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family Name</TableHead>
                <TableHead>Head of Household / Phone</TableHead>
                <TableHead>Total Household Members</TableHead>
                <TableHead>Sebeka Contribution</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-semibold text-text-primary">{f.name}</TableCell>
                  <TableCell className="text-text-secondary">{f.phone ?? "—"}</TableCell>
                  <TableCell className="font-medium text-text-primary">{f._count.members} members</TableCell>
                  <TableCell className={f.sebekaStatus === "Paid" ? "font-semibold text-success" : "text-warning"}>{f.sebekaStatus}</TableCell>
                  <TableCell className="text-right text-text-secondary">{f.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
