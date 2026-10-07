"use client";

import * as React from "react";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

interface LiturgicalRibbonProps {
  fiscalBalance?: number;
}

/**
 * Liturgical Header Ribbon (ERP Utility)
 * From Stitch Design System: "Tewahedo Sacred Ledger"
 * Displays active Diocese context, Kidist Ba'ata feast calendar cycle,
 * and current ledger fiscal balance in tabular gold numerals.
 */
export function LiturgicalRibbon({ fiscalBalance }: LiturgicalRibbonProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  return (
    <div className="relative z-20 flex h-10 w-full items-center justify-between border-b border-[#29222C] bg-[#131014] px-4 text-[#FAF8F5] sm:px-6">
      {/* Left: Diocese & Church Hierarchy */}
      <div className="flex items-center gap-2.5 overflow-hidden">
        <EthiopicCross size={15} variant="gold" />
        <div className="flex items-center gap-2 text-[11.5px] font-medium tracking-wide">
          <span className="text-[#C69214]">
            {isAmharic ? "ምዕራብ ጎጃም ሀገረ ስብከት" : "Archdiocese of West Gojjam"}
          </span>
          <span className="text-white/20">|</span>
          <span className="truncate text-white/80">
            {isAmharic
              ? "ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም"
              : "Chagni Birhane Genet Kidist Ba'ata Lemariyam"}
          </span>
        </div>
      </div>

      {/* Right: Feast Day Tracker & Active Fiscal Balance */}
      <div className="flex shrink-0 items-center gap-4 text-[11.5px]">
        {/* Feast cycle tracker */}
        <div className="hidden items-center gap-1.5 rounded bg-white/5 px-2.5 py-0.5 text-white/70 md:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C69214] animate-pulse" />
          <span>
            {isAmharic ? "የበዓል ዑደት፡ ቅድስት በዓታ ለማርያም" : "Feast Cycle: Kidist Ba'ata Lemariyam"}
          </span>
        </div>

        {/* Tabular Fiscal Balance */}
        <div className="flex items-center gap-1.5 font-medium tabular-nums">
          <span className="text-white/50 text-[10.5px] uppercase tracking-wider">
            {isAmharic ? "የሂሳብ ሚዛን" : "Fiscal Balance"}:
          </span>
          <span className="font-semibold text-[#FDC348]">
            {fiscalBalance !== undefined
              ? `${fiscalBalance.toLocaleString()} ETB`
              : "1,248,500.00 ETB"}
          </span>
        </div>
      </div>
    </div>
  );
}
