"use client";

import * as React from "react";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";

export function ParishSealCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#7A1C2E] via-[#631625] to-[#40000F] p-5 text-white shadow-card border border-[#C69214]/30">
      {/* Background Decorative Cross Pattern */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-10">
        <EthiopicCross size={180} variant="gold" />
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded bg-white/10 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-[#FDC348] backdrop-blur-sm">
            <span>የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን</span>
          </span>
          <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-white/90">
            EOTC
          </span>
        </div>

        {/* Church Canonical Name strictly using በዓታ */}
        <div>
          <h2 className="font-serif text-[18px] font-bold leading-snug tracking-tight text-[#FAF8F5]">
            ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-white/70">
            Chagni Birhane Genet Kidist Ba&apos;ata Lemariyam Church
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/15" />

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-[11px]">
          <div>
            <span className="text-white/60">የተመሠረተበት ዘመን: </span>
            <span className="font-bold text-[#FDC348]">1948 ዓ.ም.</span>
          </div>
          <div className="text-right">
            <span className="text-white/60">የሰበካ ኮድ: </span>
            <span className="font-bold text-white">EOTC-CHG-014</span>
          </div>
        </div>
      </div>
    </div>
  );
}
