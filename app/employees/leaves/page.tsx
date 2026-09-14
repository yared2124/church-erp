import type { Metadata } from "next";
import { CalendarOff, CheckCircle2, Clock, XCircle } from "lucide-react";
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
  title: "Leave Requests — Birhane Genet St. Mary Church",
};

export default async function EmployeeLeavesPage() {
  await requireAuth();

  const leaves = await prisma.leaveRequest.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = leaves.filter(l => l.status === "Pending").length;
  const approvedCount = leaves.filter(l => l.status === "Approved").length;
  const rejectedCount = leaves.filter(l => l.status === "Rejected").length;

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: "Leaves" },
        ]}
        title="Leave Requests & Approvals"
        description="Sick leave, annual leave, and compassionate leave applications"
      />

      <EmployeeTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending Review" value={String(pendingCount)} icon={Clock} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Approved Leaves" value={String(approvedCount)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Rejected Requests" value={String(rejectedCount)} icon={XCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Applications</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-text-muted">No leave requests submitted.</TableCell>
                </TableRow>
              ) : (
                leaves.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-semibold text-text-primary">{l.employee.fullName}</TableCell>
                    <TableCell className="text-text-secondary">{l.employee.department}</TableCell>
                    <TableCell className="text-text-secondary">{new Date(l.startDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-text-secondary">{new Date(l.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-text-secondary">{l.reason ?? "Annual Leave"}</TableCell>
                    <TableCell className="text-right">
                      <Badge tone={l.status === "Approved" ? "success" : l.status === "Pending" ? "warning" : "danger"}>
                        {l.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
