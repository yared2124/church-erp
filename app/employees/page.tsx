import type { Metadata } from "next";
import { Users, UserCheck, CalendarOff, UserPlus, Plus, Download } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTable } from "@/components/employees/employee-table";
import {
  EmployeesByDepartmentCard,
  DepartmentDistributionCard,
  EmploymentTypeCard,
  LeaveSummaryCard,
} from "@/components/employees/employee-charts";
import { EmployeeQuickActions } from "@/components/employees/employee-quick-actions";
import { requireAuth } from "@/lib/api-helpers";
import { employeeService } from "@/features/employees/employee.service";

export const metadata: Metadata = {
  title: "Employees — Birhane Genet St. Mary Church",
};

export default async function EmployeesOverviewPage() {
  await requireAuth();
  const s = await employeeService.overview();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: "Overview" },
        ]}
        title="Employees"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
            <Button icon={<Plus size={16} />}>Add Employee</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={String(s.total)} icon={Users} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Active Employees" value={String(s.active)} icon={UserCheck} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="On Leave" value={String(s.onLeave)} icon={CalendarOff} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="New Hires (This Month)" value={String(s.newHires)} icon={UserPlus} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <EmployeesByDepartmentCard data={s.byDepartment} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8 xl:grid-cols-2">
          <EmploymentTypeCard data={s.byEmploymentType} />
          <LeaveSummaryCard summary={s.leaveSummary} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Employees</CardTitle>
            </CardHeader>
            <EmployeeTable />
          </Card>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-4">
          <DepartmentDistributionCard data={s.byDepartment} />
          <EmployeeQuickActions />
        </div>
      </div>
    </PageContainer>
  );
}
