"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Baptisms", href: "/sacraments/baptisms" },
  { label: "Marriages", href: "/sacraments/marriages" },
  { label: "Burials", href: "/sacraments/burials" },
];

/**
 * Route-driven tab strip (each tab is a real page, not client-side state),
 * so the URL and the sidebar submenu stay in sync with the active tab —
 * matches the Sacraments screenshot exactly.
 */
export function SacramentTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex gap-6 border-b border-border">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative pb-3 text-[14px] font-medium transition-colors duration-150",
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
