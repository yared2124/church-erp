import type { Metadata } from "next";
import { Clock, UserCheck, CalendarCheck, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmployeeTabs } from "@/components/employees/employee-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Staff Attendance — Birhane Genet St. Mary Church",
};

export default async function EmployeeAttendancePage() {
  await requireAuth();

  const employees = await prisma.employee.findMany({
    orderBy: { fullName: "asc" },
  });

  const activeCount = employees.filter(e => e.status === "Active").length;
  const onLeaveCount = employees.filter(e => e.status === "OnLeave").length;

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: "Attendance" },
        ]}
        title="Staff Attendance & Duty Roster"
        description="Daily service presence, liturgical assignments, and duty tracking"
      />

      <EmployeeTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Present on Duty" value={String(activeCount)} icon={UserCheck} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Authorized Leave" value={String(onLeaveCount)} icon={CalendarCheck} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Total Staff Roster" value={String(employees.length)} icon={Clock} iconBg="bg-primary-light" iconColor="text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Duty Status</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Duty Status</TableHead>
                <TableHead className="text-right">Employment Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-semibold text-text-primary">{e.fullName}</TableCell>
                  <TableCell className="text-text-secondary">{e.department}</TableCell>
                  <TableCell className="text-text-secondary">{e.position}</TableCell>
                  <TableCell>
                    <Badge tone={e.status === "Active" ? "success" : "warning"}>
                      {e.status === "Active" ? "On Duty (በሥራ ገበታ)" : "On Leave (በዕረፍት)"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">{e.employmentType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
