import type { Metadata } from "next";
import { Users, UserCheck, CalendarOff, Plus, Download } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { EmployeeTabs } from "@/components/employees/employee-tabs";
import { EmployeeTable } from "@/components/employees/employee-table";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "All Employees — Birhane Genet St. Mary Church",
};

export default async function AllEmployeesPage() {
  await requireAuth();

  const [total, active, onLeave] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "Active" } }),
    prisma.employee.count({ where: { status: "OnLeave" } }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: "All Employees" },
        ]}
        title="All Church Staff & Clergy"
        description="Comprehensive directory of church employees, clergy, and administrative personnel"
      />

      <EmployeeTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Staff" value={String(total)} icon={Users} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Active" value={String(active)} icon={UserCheck} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="On Leave" value={String(onLeave)} icon={CalendarOff} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <Card>
        <EmployeeTable />
      </Card>
    </PageContainer>
  );
}
