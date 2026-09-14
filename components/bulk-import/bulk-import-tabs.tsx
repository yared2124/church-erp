"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export function BulkImportTabs() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const tabs = [
    { label: isAmharic ? "አጠቃላይ እይታ" : "Overview", href: "/bulk-import" },
    { label: isAmharic ? "የአባላት ምዝገባ" : "Import Members", href: "/bulk-import/members" },
    { label: isAmharic ? "የሂሳብ መዝገብ" : "Import Accounts", href: "/bulk-import/accounts" },
    { label: isAmharic ? "የፋይናንስ እንቅስቃሴዎች" : "Import Transactions", href: "/bulk-import/transactions" },
    { label: isAmharic ? "የስጦታ መዝገብ" : "Import Donations", href: "/bulk-import/donations" },
    { label: isAmharic ? "የንብረት መዝገብ" : "Import Assets", href: "/bulk-import/assets" },
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
