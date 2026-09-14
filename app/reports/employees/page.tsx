import type { Metadata } from "next";
import { Users, UserCheck, CalendarOff, DollarSign, Download, Printer } from "lucide-react";
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
  title: "Employees Report — Birhane Genet St. Mary Church",
};

export default async function EmployeeReportPage() {
  await requireAuth();

  const employees = await prisma.employee.findMany({
    orderBy: { department: "asc" },
  });

  const activeCount = employees.filter(e => e.status === "Active").length;
  const onLeaveCount = employees.filter(e => e.status === "OnLeave").length;

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports & Analytics", href: "/reports" },
          { label: "Employees" },
        ]}
        title="Church Staff & Human Resources Report"
        description="Headcount distribution, department staffing levels, and clergy roster"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Printer size={15} />}>Print</Button>
            <Button variant="secondary" icon={<Download size={15} />}>Export PDF</Button>
            <Button icon={<Download size={15} />}>Export Excel</Button>
          </div>
        }
      />

      <ReportTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Staff Roster" value={String(employees.length)} icon={Users} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Active on Duty" value={String(activeCount)} icon={UserCheck} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="On Leave" value={String(onLeaveCount)} icon={CalendarOff} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Departmental Distribution</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Employment Type</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-semibold text-text-primary">{e.fullName}</TableCell>
                  <TableCell className="text-text-secondary">{e.department}</TableCell>
                  <TableCell className="text-text-secondary">{e.position}</TableCell>
                  <TableCell className="text-text-secondary">{e.employmentType}</TableCell>
                  <TableCell className={e.status === "Active" ? "text-right font-medium text-success" : "text-right font-medium text-warning"}>
                    {e.status}
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
