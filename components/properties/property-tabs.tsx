"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export function PropertyTabs() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const tabs = [
    { label: isAmharic ? "አጠቃላይ እይታ" : "Overview", href: "/property" },
    { label: isAmharic ? "የኪራይ ቤቶች" : "Houses", href: "/property/houses" },
    { label: isAmharic ? "ተከራዮች" : "Tenants", href: "/property/tenants" },
    { label: isAmharic ? "የኪራይ ክፍያዎች" : "Rent Payments", href: "/property/rent-payments" },
    { label: isAmharic ? "የውል ስምምነቶች" : "Lease Agreements", href: "/property/lease-agreements" },
    { label: isAmharic ? "ጥገናዎች" : "Maintenance", href: "/property/maintenance" },
    { label: isAmharic ? "ያለፈባቸው ኪራዮች" : "Overdue Rentals", href: "/property/overdue-rentals" },
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
