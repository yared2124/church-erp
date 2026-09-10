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
    <Card hoverable className="group relative overflow-hidden">
      <div className="mb-3.5 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${iconBg}`}
        >
          <Icon size={22} className={iconColor} strokeWidth={2.2} />
        </div>
        {trend && (
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${
              isUp ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
            }`}
          >
            {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-[13px] font-medium text-text-secondary">{label}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[28px] font-extrabold tracking-tight text-text-primary">
            {value}
          </span>
          {suffix && (
            <span className="text-[13px] font-bold text-text-muted">{suffix}</span>
          )}
        </div>
      </div>

      {trendLabel && trend && (
        <p className="mt-2 text-[11.5px] text-text-muted">{trendLabel}</p>
      )}

      {/* Subtle bottom highlight bar on hover */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-primary/40 transition-transform duration-200 group-hover:scale-x-100" />
    </Card>
  );
}
