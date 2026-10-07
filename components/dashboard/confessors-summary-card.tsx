"use client";

import * as React from "react";
import Link from "next/link";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";

interface Confessor {
  name: string;
  role: string;
  spiritualChildrenCount: number;
}

const DEFAULT_CONFESSORS: Confessor[] = [
  {
    name: "መልአከ ገነት ቀሲስ እስጢፋኖስ",
    role: "ቀሲስ አስተዳዳሪና የንስሐ አባት",
    spiritualChildrenCount: 412,
  },
  {
    name: "መጋቤ ሐዲስ ቀሲስ ዮሐንስ",
    role: "የስብከተ ወንጌል ኃላፊ",
    spiritualChildrenCount: 385,
  },
  {
    name: "ሊቀ ጠበብት ቀሲስ ገብረ ሥላሴ",
    role: "የክህነት ሥርዓት ትምህርት መሪ",
    spiritualChildrenCount: 320,
  },
];

export function ConfessorsSummaryCard({ confessors = DEFAULT_CONFESSORS }: { confessors?: Confessor[] }) {
  return (
    <div className="rounded-xl border border-[#E4E2DF] bg-white p-4.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E2DF] pb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            መንፈሳዊ አባቶች / CONFESSORS
          </div>
          <h3 className="text-[14px] font-bold text-slate-800">
            የካህናት የንስሐ ልጆች ብዛት
          </h3>
        </div>
        <span className="rounded-full bg-[#FDF8ED] border border-[#C69214]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#9A6F0A]">
          14 አባቶች
        </span>
      </div>

      {/* Confessor List */}
      <div className="divide-y divide-slate-100 py-2">
        {confessors.map((c, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 transition-colors hover:bg-slate-50/80 px-1 rounded-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FDF8ED] border border-[#C69214]/40 text-[#9A6F0A]">
                <EthiopicCross size={13} variant="gold" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-bold text-slate-800">
                  {c.name}
                </div>
                <div className="truncate text-[11px] text-slate-500">
                  {c.role}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 pl-2">
              <span className="text-[14px] font-bold text-slate-900 tabular-nums">
                {c.spiritualChildrenCount}
              </span>
              <div className="text-[10px] text-slate-500">የንስሐ ልጆች</div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          href="/members/confessors"
          className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50/80 py-2 text-[12px] font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#7A1C2E]"
        >
          ሁሉንም 14 ካህናትና የንስሐ ልጆች ይመልከቱ
        </Link>
      </div>
    </div>
  );
}
