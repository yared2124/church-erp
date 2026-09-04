import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";
import { Card } from "./card";

export interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  trend?: string;
  direction?: "up" | "down";
  trendLabel?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

/**
 * Same icon+label+value+trend pattern as the Dashboard's KpiCard, generalized
 * for reuse in every module's stat row (Members, Sacraments, Finance, etc.).
 */
export function StatCard({
  label,
  value,
  suffix,
  trend,
  direction = "up",
  trendLabel = "from last month",
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  const isUp = direction === "up";
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${iconBg}`}>
          <Icon size={22} className={iconColor} strokeWidth={2} />
        </div>
        <p className="text-[13.5px] font-medium text-text-secondary">{label}</p>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-bold leading-none text-text-primary">{value}</span>
        {suffix && <span className="text-[13px] font-semibold text-text-secondary">{suffix}</span>}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1 text-[12.5px]">
          {isUp ? (
            <ArrowUp size={13} className="text-success" />
          ) : (
            <ArrowDown size={13} className="text-danger" />
          )}
          <span className={`font-semibold ${isUp ? "text-success" : "text-danger"}`}>{trend}</span>
          <span className="text-text-muted">{trendLabel}</span>
        </div>
      )}
    </Card>
  );
}
