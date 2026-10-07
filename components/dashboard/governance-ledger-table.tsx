"use client";

import * as React from "react";
import Link from "next/link";
import { Filter, BookOpen, CheckCircle2, Clock } from "lucide-react";

export interface TransactionRow {
  voucherNo: string;
  ethDate: string;
  gcDate: string;
  description: string;
  subDetail: string;
  category: string;
  type: "CR" | "DR";
  amount: number;
  status: "verified" | "paid" | "pending";
}

const DEFAULT_TRANSACTIONS: TransactionRow[] = [
  {
    voucherNo: "VCH-2024-0891",
    ethDate: "ጥቅምት ፳፫",
    gcDate: "Nov 02, 2024",
    description: "ዓመታዊ ሰበካ መዋጮ - አቶ ተክለማርያም",
    subDetail: "መታወቂያ: EOTC-MBR-0941 • ዞን ፩",
    category: "ሰበካ ጉባኤ ገቢ",
    type: "CR",
    amount: 1500,
    status: "verified",
  },
  {
    voucherNo: "VCH-2024-0890",
    ethDate: "ጥቅምት ፳፪",
    gcDate: "Nov 01, 2024",
    description: "የእሑድ አስራት የሣጥን ገቢ (Sunday Vow)",
    subDetail: "የሰንበት ቅዳሴ ሳጥን ስብስብ",
    category: "ሥርዓተ አምልኮ ገቢ",
    type: "CR",
    amount: 8420,
    status: "verified",
  },
  {
    voucherNo: "VCH-2024-0889",
    ethDate: "ጥቅምት ፳፩",
    gcDate: "Oct 31, 2024",
    description: "የካህናትና ዲያቆናት ወርሃዊ አበል (Clergy Stipends)",
    subDetail: "ጥቅምት ወር ደመወዝ ለ18 አገልጋዮች",
    category: "ካህናት ደመወዝ",
    type: "DR",
    amount: 48200,
    status: "paid",
  },
  {
    voucherNo: "VCH-2024-0888",
    ethDate: "ጥቅምት ፳",
    gcDate: "Oct 30, 2024",
    description: "የቤተ መቅደስ ጧፍ እና ዕጣን ግዢ (Incense & Candles)",
    subDetail: "ደረሰኝ #CHG-STORE-419",
    category: "አላቂ ዕቃዎች",
    type: "DR",
    amount: 3450,
    status: "verified",
  },
  {
    voucherNo: "VCH-2024-0887",
    ethDate: "ጥቅምት ፲፱",
    gcDate: "Oct 29, 2024",
    description: "የንግድ ቤት ኪራይ ወርሃዊ ገቢ (Store Rental)",
    subDetail: "ተከራይ: ቴዎድሮስ ክህነት ንብረት",
    category: "የኪራይ ገቢ",
    type: "CR",
    amount: 12000,
    status: "verified",
  },
];

export function GovernanceLedgerTable({ transactions = DEFAULT_TRANSACTIONS }: { transactions?: TransactionRow[] }) {
  return (
    <div className="rounded-xl border border-[#E4E2DF] bg-white p-5 shadow-sm">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E2DF] pb-3.5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ዋና የሂሳብ መዝገብ / LEDGER AUDIT
          </div>
          <h3 className="text-[15px] font-bold text-slate-900">
            የቅርብ ጊዜ የገንዘብ ዝውውሮች (Recent Transactions)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <Filter size={13} />
            <span>አጣራ (Filter)</span>
          </button>
          <Link
            href="/finance/transactions"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A1C2E] px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-[#631625]"
          >
            <BookOpen size={13} />
            <span>ሙሉ መዝገብ (View Ledger)</span>
          </Link>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-2">የቫውቸር ቁጥር</th>
              <th className="py-3 px-2">ቀን (ETH/GC)</th>
              <th className="py-3 px-2">የዝውውር ዝርዝር</th>
              <th className="py-3 px-2">ፈንድ / ምድብ</th>
              <th className="py-3 px-2">አይነት</th>
              <th className="py-3 px-2 text-right">መጠን (ETB)</th>
              <th className="py-3 px-2 text-center">የኦዲት ሁኔታ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {transactions.map((tx) => (
              <tr key={tx.voucherNo} className="hover:bg-slate-50/70 transition-colors">
                {/* Voucher # */}
                <td className="py-3 px-2 font-mono text-[11.5px] font-bold text-[#7A1C2E]">
                  {tx.voucherNo}
                </td>

                {/* Date */}
                <td className="py-3 px-2 leading-tight">
                  <div className="font-bold text-slate-800">{tx.ethDate}</div>
                  <div className="text-[10px] text-slate-400">{tx.gcDate}</div>
                </td>

                {/* Description */}
                <td className="py-3 px-2 max-w-[220px]">
                  <div className="truncate font-bold text-slate-900">{tx.description}</div>
                  <div className="truncate text-[10.5px] text-slate-500">{tx.subDetail}</div>
                </td>

                {/* Category */}
                <td className="py-3 px-2 text-slate-700">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold">
                    {tx.category}
                  </span>
                </td>

                {/* Type CR / DR */}
                <td className="py-3 px-2">
                  {tx.type === "CR" ? (
                    <span className="inline-flex rounded px-2 py-0.5 text-[10.5px] font-bold bg-[#FDF8ED] text-[#9A6F0A]">
                      ገቢ (CR)
                    </span>
                  ) : (
                    <span className="inline-flex rounded px-2 py-0.5 text-[10.5px] font-bold bg-rose-50 text-[#7A1C2E]">
                      ወጪ (DR)
                    </span>
                  )}
                </td>

                {/* Amount */}
                <td className="py-3 px-2 text-right tabular-nums">
                  <span className={tx.type === "CR" ? "font-bold text-slate-900" : "font-bold text-[#7A1C2E]"}>
                    {tx.type === "DR" ? "-" : ""}
                    {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="ml-1 text-[10px] text-slate-400">ETB</span>
                </td>

                {/* Audit Status */}
                <td className="py-3 px-2 text-center">
                  {tx.status === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#C69214]/30 bg-[#FDF8ED] px-2 py-0.5 text-[10.5px] font-bold text-[#9A6F0A]">
                      <CheckCircle2 size={11} />
                      <span>የተረጋገጠ</span>
                    </span>
                  ) : tx.status === "paid" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-700">
                      <CheckCircle2 size={11} />
                      <span>የተከፈለ</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">
                      <Clock size={11} />
                      <span>በመጠባበቅ ላይ</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <span>ማስታወሻ፡ የሂሳብ ዝውውሮች በየቀኑ በኦዲተሩና በዋና ጸሐፊው የተረጋገጡ ብቻ ናቸው።</span>
        <span className="font-mono font-bold text-slate-700">ገጽ 1 ከ 24</span>
      </div>
    </div>
  );
}
