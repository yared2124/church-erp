"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface RentStatusDatum { label: string; count: number; value: number; color: string }
interface TypeDatum { label: string; value: number; pct: string }

export function RentStatusOverviewCard({ data }: { data: RentStatusDatum[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>Rent Status Overview</CardTitle>
      </CardHeader>
      <div className="relative mx-auto h-[160px] w-[160px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="label" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0}>
              {data.map((d) => <Cell key={d.label} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[20px] font-bold text-text-primary">{total}</p>
          <p className="text-[10.5px] text-text-muted">Records</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-[12.5px]">
            <span className="flex items-center gap-1.5 text-text-primary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.label}
            </span>
            <span className="text-text-secondary">{d.count} ({d.value}%)</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const TYPE_COLORS = ["#4F46E5", "#16A34A", "#F59E0B", "#EF4444", "#94A3B8"];

export function PropertiesByTypeCard({ data }: { data: TypeDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>Properties by Type</CardTitle>
      </CardHeader>
      <div className="flex items-center gap-6">
        <div className="relative h-[150px] w-[150px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
                {data.map((d, i) => <Cell key={d.label} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[18px] font-bold text-text-primary">{total}</p>
            <p className="text-[10px] text-text-muted">Total</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-1.5 text-text-primary">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} /> {d.label}
              </span>
              <span className="text-text-secondary">{d.value} ({d.pct})</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
