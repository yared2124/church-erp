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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-page-title text-text-primary">{t("sidebar.dashboard")}</h1>
          <span className="hidden items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-bold text-primary sm:inline-flex">
            <Sparkles size={12} />
            Live Sync
          </span>
        </div>
        <p className="mt-1 text-body text-text-secondary">
          {locale === "am"
            ? "የቤተክርስቲያን አጠቃላይ የስራ እንቅስቃሴ እና ዋና ዋና መረጃዎች ማጠቃለያ"
            : "Overview of church operations and key performance metrics"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button className="flex h-control-md items-center gap-2 rounded-xl border border-border/80 bg-surface px-3.5 text-[13px] font-semibold text-text-primary shadow-card transition-all duration-150 hover:bg-background-alt hover:border-primary/30">
          <Calendar size={15} className="text-primary" />
          <span>{monthRange}</span>
          <ChevronDown size={14} className="text-text-muted" />
        </button>

        <Button href="/reports" icon={<Plus size={16} />} className="rounded-xl shadow-card">
          {locale === "am" ? "ሪፖርት አውጣ" : "Generate Report"}
        </Button>

        <button
          aria-label="More options"
          className="flex h-control-md w-control-md items-center justify-center rounded-xl border border-border/80 bg-surface text-text-secondary shadow-card transition-all duration-150 hover:bg-background-alt hover:text-text-primary"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
