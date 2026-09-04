"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface Datum { label: string; value: number; pct: string }

const DEPT_COLORS = ["#4F46E5", "#16A34A", "#F59E0B", "#7C3AED", "#3B82F6", "#94A3B8"];
const TYPE_COLORS = ["#4F46E5", "#16A34A", "#F59E0B", "#94A3B8"];

export function EmployeesByDepartmentCard({ data }: { data: Datum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>Employees by Department</CardTitle>
      </CardHeader>
      <div className="relative mx-auto h-[150px] w-[150px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
              {data.map((d, i) => <Cell key={d.label} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[18px] font-bold text-text-primary">{total}</p>
          <p className="text-[10px] text-text-muted">Total Employees</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-text-primary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} /> {d.label}
            </span>
            <span className="text-text-secondary">{d.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DepartmentDistributionCard({ data }: { data: Datum[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Distribution</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2.5">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 text-text-primary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} /> {d.label}
            </span>
            <span className="font-semibold text-text-secondary">{d.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EmploymentTypeCard({ data }: { data: Datum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Type</CardTitle>
      </CardHeader>
      <div className="relative mx-auto h-[140px] w-[140px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={44} outerRadius={68} paddingAngle={2} strokeWidth={0}>
              {data.map((d, i) => <Cell key={d.label} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[16px] font-bold text-text-primary">{total}</p>
          <p className="text-[10px] text-text-muted">Total</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-text-primary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} /> {d.label}
            </span>
            <span className="text-text-secondary">{d.value} ({d.pct})</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function LeaveSummaryCard({ summary }: { summary: { totalRequests: number; approved: number; pending: number; rejected: number } }) {
  const l = summary;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Summary</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2.5 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Total Leave Requests</span>
          <span className="font-semibold text-text-primary">{l.totalRequests}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Approved</span>
          <span className="font-semibold text-success">{l.approved}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Pending</span>
          <span className="font-semibold text-warning">{l.pending}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Rejected</span>
          <span className="font-semibold text-danger">{l.rejected}</span>
        </div>
      </div>
    </Card>
  );
}
