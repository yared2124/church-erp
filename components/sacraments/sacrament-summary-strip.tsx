import { Church } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SacramentType } from "@/features/sacraments/sacrament.types";

interface SacramentSummaryStripProps {
  type: SacramentType;
  thisYear: number;
  lastYear: number;
  mostActiveMonth: string;
  topPriest: string;
  topChurch: string;
}

export function SacramentSummaryStrip({
  type,
  thisYear,
  lastYear,
  mostActiveMonth,
  topPriest,
  topChurch,
}: SacramentSummaryStripProps) {
  const trendPct = lastYear > 0 ? (((thisYear - lastYear) / lastYear) * 100).toFixed(1) : null;

  return (
    <Card className="flex flex-wrap items-center gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light">
          <Church size={22} className="text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-text-primary">{type} Summary</p>
        </div>
      </div>

      <SummaryStat
        label="This Year"
        value={String(thisYear)}
        sub={trendPct !== null ? `${Number(trendPct) >= 0 ? "+" : ""}${trendPct}%` : undefined}
        subPositive={trendPct !== null && Number(trendPct) >= 0}
      />
      <SummaryStat label="Last Year" value={String(lastYear)} />
      <SummaryStat label={`Most ${type}s (Month)`} value={mostActiveMonth} />
      <SummaryStat label="Priest with Most" value={topPriest} />
      <SummaryStat label="Church with Most" value={topChurch} />
    </Card>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  subPositive,
}: {
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
}) {
  return (
    <div>
      <p className="text-[12px] text-text-muted">{label}</p>
      <p className="text-[15px] font-bold text-text-primary">{value}</p>
      {sub && (
        <p className={`text-[11.5px] font-semibold ${subPositive ? "text-success" : "text-text-secondary"}`}>{sub}</p>
      )}
    </div>
  );
}
