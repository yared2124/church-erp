import type { Metadata } from "next";
import { Building2, Users, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmployeeTabs } from "@/components/employees/employee-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Departments — Birhane Genet St. Mary Church",
};

export default async function EmployeeDepartmentsPage() {
  await requireAuth();

  const employees = await prisma.employee.findMany({
    select: { department: true, status: true, fullName: true, position: true },
  });

  const deptMap: Record<string, { total: number; active: number; roles: Set<string> }> = {};
  employees.forEach((e) => {
    if (!deptMap[e.department]) {
      deptMap[e.department] = { total: 0, active: 0, roles: new Set() };
    }
    deptMap[e.department].total += 1;
    if (e.status === "Active") deptMap[e.department].active += 1;
    deptMap[e.department].roles.add(e.position);
  });

  const depts = Object.entries(deptMap).map(([name, data]) => ({
    name,
    total: data.total,
    active: data.active,
    roleCount: data.roles.size,
  }));

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: "Departments" },
        ]}
        title="Church Departments & Ministries"
        description="Functional divisions of church staff and clergy operations"
      />

      <EmployeeTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Departments" value={String(depts.length)} icon={Building2} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Total Assigned Personnel" value={String(employees.length)} icon={Users} iconBg="bg-gold-light" iconColor="text-gold" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departments Directory</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name (ክፍል)</TableHead>
                <TableHead>Total Employees</TableHead>
                <TableHead>Active Personnel</TableHead>
                <TableHead className="text-right">Positions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depts.map((d) => (
                <TableRow key={d.name}>
                  <TableCell className="font-semibold text-text-primary">{d.name}</TableCell>
                  <TableCell className="font-medium text-text-primary">{d.total} staff</TableCell>
                  <TableCell className="text-success font-medium">{d.active} active</TableCell>
                  <TableCell className="text-right text-text-secondary">{d.roleCount} distinct roles</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
