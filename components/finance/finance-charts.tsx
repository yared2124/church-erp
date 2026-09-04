"use client";

import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryBreakdown, MonthlyTrendPoint } from "@/features/finance/finance.types";

function formatCompact(value: number) {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`.replace(".0M", "M");
  if (abs >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
  fontSize: 12.5,
};

const PALETTE = ["#4F46E5", "#16A34A", "#F59E0B", "#EF4444", "#7C3AED", "#94A3B8", "#3B82F6", "#EC4899"];

export function IncomeExpenseTrendCard({ data }: { data: MonthlyTrendPoint[] }) {
  return (
    <Card className="xl:col-span-8">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <div className="mb-2 flex gap-5 text-[12.5px] text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" /> Expenses
        </span>
      </div>
      {data.length === 0 ? (
        <p className="py-12 text-center text-small text-text-secondary">No transactions recorded this year yet.</p>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="financeIncomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="financeExpensesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#EEF0F4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString()} ETB`} />
              <Area type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={2.5} fill="url(#financeIncomeFill)" dot={{ r: 3, fill: "#16A34A", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#financeExpensesFill)" dot={{ r: 3, fill: "#EF4444", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function CategoryDonut({ title, data, centerLabel }: { title: string; data: CategoryBreakdown[]; centerLabel: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {data.length === 0 ? (
        <p className="py-12 text-center text-small text-text-secondary">No data yet.</p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-[150px] w-[150px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
                  {data.map((d, i) => (
                    <Cell key={d.label} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[15px] font-bold text-text-primary">{formatCompact(total)}</p>
              <p className="text-[10.5px] text-text-muted">{centerLabel}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {data.map((d, i) => (
              <div key={d.label} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="flex items-center gap-1.5 text-text-primary">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                  {d.label}
                </span>
                <span className="shrink-0 text-text-secondary">
                  {d.pct} <span className="text-text-muted">· {d.value.toLocaleString()}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function IncomeByCategoryCard({ data }: { data: CategoryBreakdown[] }) {
  return <CategoryDonut title="Income by Category" data={data} centerLabel="Total Income" />;
}

export function ExpenseByCategoryCard({ data }: { data: CategoryBreakdown[] }) {
  return <CategoryDonut title="Expense by Category" data={data} centerLabel="Total Expenses" />;
}
