import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-background-alt text-text-secondary",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/**
 * Soft-background + semantic-text badge. Never use a saturated fill.
 * Map status → tone: Paid/Approved/Active → success, Pending/Draft-adjacent → warning,
 * Overdue/Rejected → danger, Transferred/Info → info, Draft/Deceased → neutral.
 */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
