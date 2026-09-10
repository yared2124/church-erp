"use client";

import * as React from "react";
import { Calendar, ChevronDown, Plus, MoreVertical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

function getCurrentMonthRange(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const monthName = firstDay.toLocaleDateString("en-US", { month: "long" });

  return `${monthName} ${firstDay.getDate()} – ${fmt(lastDay)}`;
}

export function DashboardHeader() {
  const { t, locale } = useLanguage();
  const monthRange = getCurrentMonthRange();

  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 sm:mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-page-title text-text-primary">{t("sidebar.dashboard")}</h1>
          <span className="hidden items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary sm:inline-flex">
            <Sparkles size={11} />
            Live Sync
          </span>
        </div>
        <p className="mt-0.5 text-[12.5px] text-text-secondary">
          {locale === "am"
            ? "የቤተክርስቲያን አጠቃላይ የስራ እንቅስቃሴ እና ዋና ዋና መረጃዎች ማጠቃለያ"
            : "Overview of church operations and key performance metrics"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-3 text-[12.5px] font-medium text-text-primary shadow-sm transition-all duration-150 hover:bg-background-alt hover:border-primary/30">
          <Calendar size={14} className="text-primary" />
          <span>{monthRange}</span>
          <ChevronDown size={13} className="text-text-muted" />
        </button>

        <Button href="/reports" icon={<Plus size={15} />} className="h-9 rounded-lg shadow-sm">
          {locale === "am" ? "ሪፖርት አውጣ" : "Generate Report"}
        </Button>

        <button
          aria-label="More options"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-surface text-text-secondary shadow-sm transition-all duration-150 hover:bg-background-alt hover:text-text-primary"
        >
          <MoreVertical size={15} />
        </button>
      </div>
    </div>
  );
}
