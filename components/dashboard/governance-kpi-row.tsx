"use client";

import * as React from "react";
import { Folder, Users, CheckCircle2, Wallet, TrendingUp } from "lucide-react";

export interface GovernanceKpis {
  sebekaCollected: number;
  sebekaQuotaPercentage: number;
  sebekaPaidFamilies: number;
  sebekaTotalFamilies: number;
  sebekaRemaining: number;
  sebekaGrowthPct: number;

  totalSouls: number;
  registeredFamilies: number;
  totalConfessors: number;

  baptismsYtd: number;
  matrimonyYtd: number;
  burialsYtd: number;
  totalSacramentsYtd: number;

  netCashFlow: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

const DEFAULT_KPIS: GovernanceKpis = {
  sebekaCollected: 1842500,
  sebekaQuotaPercentage: 78.4,
  sebekaPaidFamilies: 1248,
  sebekaTotalFamilies: 1592,
  sebekaRemaining: 507500,
  sebekaGrowthPct: 6.2,

  totalSouls: 4872,
  registeredFamilies: 1184,
  totalConfessors: 14,

  baptismsYtd: 142,
  matrimonyYtd: 38,
  burialsYtd: 29,
  totalSacramentsYtd: 209,

  netCashFlow: 153350,
  monthlyIncome: 342800,
  monthlyExpense: 189450,
};

export function GovernanceKpiRow({ kpis = DEFAULT_KPIS }: { kpis?: GovernanceKpis }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. SEBEKA DUES */}
      <div className="rounded-xl border border-[#E4E2DF] bg-white p-4.5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ዓመታዊ መዋጮ / SEBEKA DUES
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C69214]/40 bg-[#FDF8ED] text-[#C69214]">
            <Folder size={14} />
          </div>
        </div>

        <div className="mt-1 text-[13px] font-bold text-slate-800">
          የሰበካ ጉባኤ ገቢ አፈጻጸም
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[23px] font-extrabold text-slate-900 tabular-nums tracking-tight">
            {kpis.sebekaCollected.toLocaleString()}
          </span>
          <span className="text-[12px] font-bold text-slate-500">ETB</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-slate-100 pt-2 text-slate-600">
          <span className="font-bold text-[#7A1C2E]">
            {kpis.sebekaQuotaPercentage}% የዓመቱ ግብ (Quota)
          </span>
          <span className="text-slate-500">
            {kpis.sebekaPaidFamilies.toLocaleString()} / {kpis.sebekaTotalFamilies.toLocaleString()} ቤተሰቦች
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
            <TrendingUp size={12} />
            <span>ወርሃዊ እድገት (+{kpis.sebekaGrowthPct}%)</span>
          </span>
          <span className="text-slate-400">
            ቀሪ: {kpis.sebekaRemaining.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* 2. CENSUS */}
      <div className="rounded-xl border border-[#E4E2DF] bg-white p-4.5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            የምዕመናን ቆጠራ / CENSUS
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#7A1C2E]/20 bg-[#FDF2F4] text-[#7A1C2E]">
            <Users size={14} />
          </div>
        </div>

        <div className="mt-1 text-[13px] font-bold text-slate-800">
          ጠቅላላ የተመዘገቡ ምዕመናን
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[23px] font-extrabold text-slate-900 tabular-nums tracking-tight">
            {kpis.totalSouls.toLocaleString()}
          </span>
          <span className="text-[12px] font-bold text-slate-500">ምዕመናን (Souls)</span>
        </div>

        <div className="mt-2.5 text-[11px] border-t border-slate-100 pt-2 text-slate-600">
          በ {kpis.registeredFamilies.toLocaleString()} ክርስቲያን አባወራና እመወራ ቤተሰቦች
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-slate-500">
          <span className="font-medium">• ነፍስ: 4,790</span>
          <span className="font-semibold text-slate-700">የንስሐ አባቶች: {kpis.totalConfessors} ካህናት</span>
        </div>
      </div>

      {/* 3. SACRAMENTS */}
      <div className="rounded-xl border border-[#E4E2DF] bg-white p-4.5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ቅዱሳት ምሥጢራት / SACRAMENTS
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
            <CheckCircle2 size={14} />
          </div>
        </div>

        <div className="mt-1 text-[13px] font-bold text-slate-800">
          የቅርብ ጊዜ ምሥጢራት (YTD)
        </div>

        {/* 3-column micro grid */}
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-slate-50 p-1.5 text-center">
          <div>
            <div className="text-[17px] font-extrabold text-[#7A1C2E] tabular-nums">
              {kpis.baptismsYtd}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">ጥምቀት</div>
            <div className="text-[9px] text-slate-400">Baptisms</div>
          </div>
          <div className="border-x border-slate-200">
            <div className="text-[17px] font-extrabold text-[#C69214] tabular-nums">
              {kpis.matrimonyYtd}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">ተክሊል</div>
            <div className="text-[9px] text-slate-400">Matrimony</div>
          </div>
          <div>
            <div className="text-[17px] font-extrabold text-slate-700 tabular-nums">
              {kpis.burialsYtd}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">ፍትሐት</div>
            <div className="text-[9px] text-slate-400">Burials</div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10.5px] text-slate-500">
          <span>ድምር የተመዘገቡ:</span>
          <span className="font-bold text-[#7A1C2E]">፪፻፱ ({kpis.totalSacramentsYtd} ምሥጢራት)</span>
        </div>
      </div>

      {/* 4. CASH FLOW */}
      <div className="rounded-xl border border-[#E4E2DF] bg-white p-4.5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ወርሃዊ ሂሳብ / CASH FLOW
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C69214]/40 bg-[#FDF8ED] text-[#C69214]">
            <Wallet size={14} />
          </div>
        </div>

        <div className="mt-1 text-[13px] font-bold text-slate-800">
          ጥቅምት ወር የተጣራ ሚዛን
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[23px] font-extrabold text-emerald-700 tabular-nums tracking-tight">
            +{kpis.netCashFlow.toLocaleString()}
          </span>
          <span className="text-[12px] font-bold text-slate-500">ETB የተጣራ</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-slate-100 pt-2 text-slate-600">
          <span>ገቢ (In): <strong className="text-slate-800">{kpis.monthlyIncome.toLocaleString()}</strong></span>
          <span>ወጪ (Out): <strong className="text-slate-800">{kpis.monthlyExpense.toLocaleString()}</strong></span>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
          <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 border border-emerald-200">
            ትርፍ (Surplus)
          </span>
          <span className="text-slate-400 font-medium">የበጀት ፍጥነት: መደበኛ</span>
        </div>
      </div>
    </div>
  );
}
