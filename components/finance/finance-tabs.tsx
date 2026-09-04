"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", href: "/finance" },
  { label: "Transactions", href: "/finance/transactions" },
  { label: "Income", href: "/finance/income" },
  { label: "Expenses", href: "/finance/expenses" },
  { label: "Sebeka Payments", href: "/finance/sebeka-payments" },
  { label: "Reports", href: "/finance/reports" },
];

export function FinanceTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex gap-6 overflow-x-auto border-b border-border scrollbar-thin">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative shrink-0 pb-3 text-[14px] font-medium transition-colors duration-150",
              active ? "text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
            {active && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
          </Link>
        );
      })}
    </div>
  );
}
