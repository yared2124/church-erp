"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export function ReportTabs() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const tabs = [
    { label: isAmharic ? "አጠቃላይ እይታ" : "Overview", href: "/reports" },
    { label: isAmharic ? "የፋይናንስ ሪፖርት" : "Financial", href: "/reports/financial" },
    { label: isAmharic ? "የአባላት ሪፖርት" : "Members", href: "/reports/members" },
    { label: isAmharic ? "የምስጢራት ሪፖርት" : "Sacraments", href: "/reports/sacraments" },
    { label: isAmharic ? "የኪራይና ንብረት ሪፖርት" : "Property", href: "/reports/property" },
    { label: isAmharic ? "የዕቃዎች ሪፖርት" : "Inventory", href: "/reports/inventory" },
    { label: isAmharic ? "የሠራተኞች ሪፖርት" : "Employees", href: "/reports/employees" },
    { label: isAmharic ? "ብጁ ሪፖርት" : "Custom", href: "/reports/custom" },
  ];

  return (
    <div className="mb-5 flex gap-5 overflow-x-auto border-b border-border scrollbar-thin">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative shrink-0 pb-3 text-[13.5px] font-medium transition-colors duration-150",
              active ? "text-primary font-semibold" : "text-text-secondary hover:text-text-primary"
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
