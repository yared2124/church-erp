"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MemberStatsResponse } from "@/features/members/member.types";

const GENDER_COLORS: Record<string, string> = { Male: "#4F46E5", Female: "#F59E0B" };

export function MembersByGenderCard({ stats, loading }: { stats: MemberStatsResponse | null; loading: boolean }) {
  const data = stats?.genderBreakdown ?? [];
  const total = data.reduce((sum, g) => sum + g.count, 0);

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Members by Gender</CardTitle>
      </CardHeader>
      {loading ? (
        <Skeleton className="h-[160px] w-full" />
      ) : total === 0 ? (
        <p className="py-8 text-center text-small text-text-secondary">No members yet.</p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="gender" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0}>
                  {data.map((g) => <Cell key={g.gender} fill={GENDER_COLORS[g.gender]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3">
            {data.map((g) => (
              <div key={g.gender} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: GENDER_COLORS[g.gender] }} />
                <span className="text-[13.5px] text-text-primary">{g.gender}</span>
                <span className="text-[12.5px] text-text-secondary">
                  {g.count.toLocaleString()} ({total ? ((g.count / total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            ))}
            <p className="mt-1 text-[12px] text-text-muted">{total.toLocaleString()} total members</p>
          </div>
        </div>
      )}
    </Card>
  );
}

export function MembersByAgeGroupCard({ stats, loading }: { stats: MemberStatsResponse | null; loading: boolean }) {
  const data = stats?.ageBreakdown ?? [];

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Members by Age Group</CardTitle>
      </CardHeader>
      {loading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <div className="h-[220px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EEF0F4" />
              <XAxis dataKey="group" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
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
