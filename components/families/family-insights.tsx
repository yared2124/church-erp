"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FamilyStatsResponse, SebekaStatus } from "@/features/families/family.types";

const STATUS_COLORS: Record<SebekaStatus, string> = {
  Paid: "#16A34A",
  Partial: "#F59E0B",
  Unpaid: "#94A3B8",
  Overdue: "#EF4444",
};

interface InsightProps {
  stats: FamilyStatsResponse | null;
  loading: boolean;
}

export function FamiliesBySebekaStatusCard({ stats, loading }: InsightProps) {
  const data = stats?.sebekaBreakdown ?? [];

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle>Families by Sebeka Status</CardTitle>
      </CardHeader>
      {loading ? (
        <Skeleton className="h-[160px] w-full" />
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-small text-text-secondary">No families yet.</p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="status" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0}>
                  {data.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3">
            {data.map((d) => (
              <div key={d.status} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.status] }} />
                <span className="text-[13.5px] text-text-primary">{d.status}</span>
                <span className="text-[12.5px] text-text-secondary">{d.count} families</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function FamiliesByYearCard({ stats, loading }: InsightProps) {
  const data = stats?.byYear ?? [];

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle>Families Registered by Year</CardTitle>
      </CardHeader>
      {loading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <div className="h-[220px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EEF0F4" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "#F5F7FF" }}
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(15,23,42,0.08)", fontSize: 12.5 }}
              />
              <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
