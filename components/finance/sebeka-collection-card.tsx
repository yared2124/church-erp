"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { FamilyPaymentStatsResponse } from "@/features/family-payments/family-payment.types";

export function SebekaCollectionStatusCard({ stats }: { stats: FamilyPaymentStatsResponse }) {
  const collectedPct = stats.expected > 0 ? Math.round((stats.totalCollected / stats.expected) * 100) : 0;
  const data = [
    { label: "Collected", value: collectedPct },
    { label: "Remaining", value: 100 - collectedPct },
  ];

  return (
    <Card className="xl:col-span-6">
      <CardHeader>
        <CardTitle>Sebeka Collection Status</CardTitle>
      </CardHeader>
      <div className="flex items-center gap-6">
        <div className="relative h-[150px] w-[150px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={52} outerRadius={72} startAngle={90} endAngle={-270} strokeWidth={0}>
                <Cell fill="#16A34A" />
                <Cell fill="#EEF0F4" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[20px] font-bold text-text-primary">{collectedPct}%</p>
            <p className="text-[10.5px] text-text-muted">Collected</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2.5 text-[13px]">
          <Row label="Families Paid" value={String(stats.familiesPaid)} valueClass="text-success" />
          <Row label="Families Unpaid" value={String(stats.familiesUnpaid)} valueClass="text-danger" />
          <Row label="Total Expected" value={`${stats.expected.toLocaleString()} ETB`} />
          <Row label="Collected Amount" value={`${stats.totalCollected.toLocaleString()} ETB`} valueClass="text-success" />
          <Row label="Outstanding" value={`${stats.outstanding.toLocaleString()} ETB`} valueClass="text-warning" />
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-semibold text-text-primary ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
