"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryDatum { label: string; value: number; pct: string }

const COLORS = ["#4F46E5", "#7C3AED", "#16A34A", "#F59E0B", "#EF4444", "#94A3B8", "#3B82F6"];

export function AssetsByCategoryCard({ data }: { data: CategoryDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card className="xl:col-span-6">
      <CardHeader>
        <CardTitle>Assets by Category</CardTitle>
      </CardHeader>
      {data.length === 0 ? (
        <p className="py-12 text-center text-small text-text-secondary">No inventory items yet.</p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative h-[150px] w-[150px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
                  {data.map((d, i) => <Cell key={d.label} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[16px] font-bold text-text-primary">{total.toLocaleString()}</p>
              <p className="text-[10px] text-text-muted">Total Items</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1.5 text-[12px]">
            {data.map((d, i) => (
              <div key={d.label} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-primary">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /> {d.label}
                </span>
                <span className="text-text-secondary">{d.pct} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function StockStatusCard({ inStock, lowStock, outOfStock }: { inStock: number; lowStock: number; outOfStock: number }) {
  const total = inStock + lowStock + outOfStock || 1;
  const data = [
    { label: "In Stock", value: inStock, color: "#16A34A" },
    { label: "Low Stock", value: lowStock, color: "#F59E0B" },
    { label: "Out of Stock", value: outOfStock, color: "#EF4444" },
  ];
  const inStockPct = Math.round((inStock / total) * 100);

  return (
    <Card className="xl:col-span-6">
      <CardHeader>
        <CardTitle>Stock Status</CardTitle>
      </CardHeader>
      <div className="relative mx-auto h-[150px] w-[150px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
              {data.map((d) => <Cell key={d.label} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[18px] font-bold text-text-primary">{inStockPct}%</p>
          <p className="text-[10px] text-text-muted">In Stock</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-text-primary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.label}
            </span>
            <span className="text-text-secondary">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
