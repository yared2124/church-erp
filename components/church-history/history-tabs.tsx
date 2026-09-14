"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export function HistoryTabs() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const tabs = [
    { label: isAmharic ? "የጊዜ ሰሌዳ" : "Timeline", href: "/history" },
    { label: isAmharic ? "ታላላቅ ክስተቶች" : "Milestones", href: "/history/milestones" },
    { label: isAmharic ? "ክስተቶች" : "Events", href: "/history/events" },
    { label: isAmharic ? "የፎቶ ማህደር" : "Gallery", href: "/history/gallery" },
    { label: isAmharic ? "ሰነዶችና መዛግብት" : "Documents", href: "/history/documents" },
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
