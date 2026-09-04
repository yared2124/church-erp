"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight tooltip for icon-only controls (e.g. collapsed sidebar items,
 * table action icons). Shows on hover and keyboard focus alike.
 */
export function Tooltip({
  label,
  children,
  side = "right",
}: {
  label: string;
  children: React.ReactNode;
  side?: "right" | "top" | "bottom";
}) {
  const [visible, setVisible] = React.useState(false);

  const sideClasses = {
    right: "left-full top-1/2 ml-2 -translate-y-1/2",
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-text-primary px-2.5 py-1.5 text-[12px] font-medium text-white shadow-elevated transition-opacity duration-150",
          sideClasses[side],
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        {label}
      </span>
    </span>
  );
}
