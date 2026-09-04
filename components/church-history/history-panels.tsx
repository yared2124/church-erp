"use client";

import { FileText, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryDatum { label: string; value: number; pct: string }

interface HistoryDocumentRow {
  id: string;
  title: string;
  uploadedAt: string;
}

const COLORS = ["#4F46E5", "#16A34A", "#F59E0B", "#7C3AED", "#EF4444"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function MilestonesByCategoryCard({ data }: { data: CategoryDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>Milestones by Decade</CardTitle>
      </CardHeader>
      {data.length === 0 ? (
        <p className="py-12 text-center text-small text-text-secondary">No milestones recorded yet.</p>
      ) : (
        <>
          <div className="relative mx-auto h-[150px] w-[150px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
                  {data.map((d, i) => <Cell key={d.label} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[18px] font-bold text-text-primary">{total}</p>
              <p className="text-[10px] text-text-muted">Total Milestones</p>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1.5 text-[11.5px]">
            {data.map((d, i) => (
              <div key={d.label} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-primary">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /> {d.label}
                </span>
                <span className="text-text-secondary">{d.value} ({d.pct})</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export function HistoricalDocumentsCard({ documents }: { documents: HistoryDocumentRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Documents</CardTitle>
      </CardHeader>
      {documents.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">No documents uploaded yet.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center gap-3 py-2">
              <FileText size={16} className="shrink-0 text-text-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-text-primary">{d.title}</p>
                <p className="text-[11.5px] text-text-muted">{formatDate(d.uploadedAt)}</p>
              </div>
              <button aria-label={`Download ${d.title}`} className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors duration-150 hover:bg-background-alt">
                <Download size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
