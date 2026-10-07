"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, TrendingUp } from "lucide-react";

interface ZoneData {
  id: string;
  name: string;
  zoneLabel: string;
  percentage: number;
  households: number;
  totalCollectedEtb: number;
  barColor: "crimson" | "gold";
}

const DEFAULT_ZONES: ZoneData[] = [
  {
    id: "zone-1",
    name: "ዞን ፩ - ማርያም ሰፈር",
    zoneLabel: "Zone 1",
    percentage: 92,
    households: 412,
    totalCollectedEtb: 492000,
    barColor: "crimson",
  },
  {
    id: "zone-2",
    name: "ዞን ፪ - ጊዮርጊስ ሰፈር",
    zoneLabel: "Zone 2",
    percentage: 84,
    households: 340,
    totalCollectedEtb: 418200,
    barColor: "gold",
  },
  {
    id: "zone-3",
    name: "ዞን ፫ - ሚካኤል ሰፈር",
    zoneLabel: "Zone 3",
    percentage: 71,
    households: 280,
    totalCollectedEtb: 364500,
    barColor: "crimson",
  },
  {
    id: "zone-4",
    name: "ዞን ፬ - አባ ገብረ መንፈስ ቅዱስ",
    zoneLabel: "Zone 4",
    percentage: 65,
    households: 216,
    totalCollectedEtb: 282100,
    barColor: "gold",
  },
];

export function ParishZonesCard({ zones = DEFAULT_ZONES }: { zones?: ZoneData[] }) {
  return (
    <div className="rounded-xl border border-[#E4E2DF] bg-white p-5 shadow-sm">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E2DF] pb-3.5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ቀጠናዊ የገቢ ክትትል (PARISH ZONES)
          </div>
          <h3 className="text-[15px] font-bold text-slate-900">
            የሰበካ ጉባኤ ዓመታዊ መዋጮ ሁኔታ በዞን
          </h3>
        </div>
        <Link
          href="/finance/sebeka-payments"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 transition-colors hover:border-[#7A1C2E] hover:text-[#7A1C2E]"
        >
          <span>ጠቅላላ 4 ቀጠናዎች (Zones)</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* 2x2 Zone Grid */}
      <div className="grid grid-cols-1 gap-3.5 py-4 sm:grid-cols-2">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="rounded-lg border border-slate-100 bg-[#FAF8F5]/60 p-3.5 transition-all hover:border-slate-300"
          >
            <div className="flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#131014] text-[10px] text-white">
                  {zone.id.split("-")[1]}
                </span>
                <span>{zone.name}</span>
                <span className="text-[11px] font-medium text-slate-400">({zone.zoneLabel})</span>
              </div>
              <span
                className={
                  zone.barColor === "crimson"
                    ? "font-extrabold text-[#7A1C2E]"
                    : "font-extrabold text-[#C69214]"
                }
              >
                {zone.percentage}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={
                  zone.barColor === "crimson"
                    ? "h-full rounded-full bg-[#7A1C2E] transition-all duration-500"
                    : "h-full rounded-full bg-[#C69214] transition-all duration-500"
                }
                style={{ width: `${zone.percentage}%` }}
              />
            </div>

            {/* Subline metrics */}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {zone.households} የተከፈሉ ቤተሰቦች (Households)
              </span>
              <span className="font-bold text-slate-800 tabular-nums">
                {zone.totalCollectedEtb.toLocaleString()} ETB
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Pace Footer */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
        <div className="flex items-center gap-2 text-[12px]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FDF8ED] text-[#C69214]">
            <TrendingUp size={15} />
          </div>
          <div>
            <div className="font-bold text-slate-800">
              የመዋጮ ስብስብ ሳምንታዊ አዝማሚያ (Weekly Pace)
            </div>
            <div className="text-[11px] text-slate-500">
              ጥቅምት ወር አማካይ: <span className="font-semibold text-[#7A1C2E]">+42,850 ETB / ሳምንት</span>
            </div>
          </div>
        </div>

        {/* 6-bar ascending sparkline */}
        <div className="flex items-end gap-1.5 h-7">
          <div className="w-2.5 rounded-t bg-[#F6E05E] h-2.5" title="Week 1" />
          <div className="w-2.5 rounded-t bg-[#ECC94B] h-3.5" title="Week 2" />
          <div className="w-2.5 rounded-t bg-[#D69E2E] h-4.5" title="Week 3" />
          <div className="w-2.5 rounded-t bg-[#DD6B20] h-5" title="Week 4" />
          <div className="w-2.5 rounded-t bg-[#9B2C2C] h-6" title="Week 5" />
          <div className="w-2.5 rounded-t bg-[#7A1C2E] h-7" title="Current Week" />
        </div>
      </div>
    </div>
  );
}
