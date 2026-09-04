"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";


function formatCompact(value: number) {
  if (value === 0) return "0";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`.replace(".0M", "M");
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-[12.5px] shadow-elevated">
      <p className="mb-1.5 font-bold text-text-primary">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5 text-text-secondary">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.dataKey === "income" ? "Income" : "Expenses"}:{" "}
          <strong className="text-text-primary">
            {Number(entry.value).toLocaleString()} ETB
          </strong>
        </div>
      ))}
    </div>
  );
}

export function IncomeExpenseChart({ data }: { data: { month: string; income: number; expenses: number }[] }) {
  return (
    <Card className="xl:col-span-8">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <button className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-[13px] font-semibold text-text-primary transition-colors duration-150 hover:bg-background-alt">
          This Year
          <ChevronDown size={14} className="text-text-muted" />
        </button>
      </CardHeader>

      <div className="mb-2 flex gap-5 text-[12.5px] text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" /> Expenses
        </span>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#EEF0F4" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#94A3B8" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCompact}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#16A34A"
              strokeWidth={2.5}
              fill="url(#incomeFill)"
              dot={{ r: 3, fill: "#16A34A", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
              strokeWidth={2.5}
              fill="url(#expensesFill)"
              dot={{ r: 3, fill: "#EF4444", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
