import type { Metadata } from "next";
import { Briefcase, Users, Award } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmployeeTabs } from "@/components/employees/employee-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Positions — Birhane Genet St. Mary Church",
};

export default async function EmployeePositionsPage() {
  await requireAuth();

  const employees = await prisma.employee.findMany({
    select: { position: true, department: true },
  });

  const posMap: Record<string, { count: number; departments: Set<string> }> = {};
  employees.forEach((e) => {
    if (!posMap[e.position]) {
      posMap[e.position] = { count: 0, departments: new Set() };
    }
    posMap[e.position].count += 1;
    posMap[e.position].departments.add(e.department);
  });

  const positions = Object.entries(posMap).map(([title, data]) => ({
    title,
    count: data.count,
    departments: Array.from(data.departments).join(", "),
  }));

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: "Positions" },
        ]}
        title="Positions & Ministry Roles"
        description="Official ecclesiastical and administrative job titles in the church"
      />

      <EmployeeTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Distinct Positions" value={String(positions.length)} icon={Briefcase} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Total Headcount" value={String(employees.length)} icon={Users} iconBg="bg-gold-light" iconColor="text-gold" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Roles Directory</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position Title (የሥራ መደብ)</TableHead>
                <TableHead>Department(s)</TableHead>
                <TableHead className="text-right">Staff Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={p.title}>
                  <TableCell className="font-semibold text-text-primary">{p.title}</TableCell>
                  <TableCell className="text-text-secondary">{p.departments}</TableCell>
                  <TableCell className="text-right font-bold text-primary">{p.count} staff</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
