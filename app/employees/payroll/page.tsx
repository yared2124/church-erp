import type { Metadata } from "next";
import { DollarSign, Wallet, Users, CheckCircle2 } from "lucide-react";
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
  title: "Payroll — Birhane Genet St. Mary Church",
};

export default async function EmployeePayrollPage() {
  await requireAuth();

  const employees = await prisma.employee.findMany({
    where: { status: "Active" },
    orderBy: [{ department: "asc" }, { fullName: "asc" }],
  });

  // Base estimate stipend table based on role & full time
  const payrollRows = employees.map((e, i) => {
    const isPriest = e.position.toLowerCase().includes("priest") || e.department.toLowerCase().includes("clergy");
    const baseSalary = isPriest ? 12000 : e.employmentType === "FullTime" ? 8500 : 4500;
    const allowance = isPriest ? 3000 : 1500;
    const netPay = baseSalary + allowance;
    return {
      id: e.id,
      name: e.fullName,
      department: e.department,
      position: e.position,
      type: e.employmentType,
      baseSalary,
      allowance,
      netPay,
    };
  });

  const totalMonthlyPayroll = payrollRows.reduce((s, r) => s + r.netPay, 0);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Employees", href: "/employees" },
          { label: "Payroll" },
        ]}
        title="Staff Payroll & Clergy Stipends"
        description="Monthly compensations, liturgical stipends, and allowances for church workers"
      />

      <EmployeeTabs />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Monthly Payroll Outflow" value={totalMonthlyPayroll.toLocaleString()} suffix="ETB" icon={Wallet} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Active Paid Personnel" value={String(employees.length)} icon={Users} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Payroll Status" value="Disbursed" icon={CheckCircle2} iconBg="bg-gold-light" iconColor="text-gold" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Payroll Breakdown</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Base Stipend</TableHead>
                <TableHead>Allowance</TableHead>
                <TableHead className="text-right">Net Payable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold text-text-primary">{r.name}</TableCell>
                  <TableCell className="text-text-secondary">{r.department}</TableCell>
                  <TableCell className="text-text-secondary">{r.position}</TableCell>
                  <TableCell className="text-text-secondary">{r.baseSalary.toLocaleString()} ETB</TableCell>
                  <TableCell className="text-text-secondary">+{r.allowance.toLocaleString()} ETB</TableCell>
                  <TableCell className="text-right font-bold text-success">{r.netPay.toLocaleString()} ETB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
