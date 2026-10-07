"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface AuditEvent {
  actor: string;
  role: string;
  timeAmharic: string;
  action: string;
  details: string;
}

const DEFAULT_EVENTS: AuditEvent[] = [
  {
    actor: "ገንዘብ ያዥ ሲሳይ",
    role: "Cashier Sisay",
    timeAmharic: "ጥቅምት ፳፫ ፲፮፡፵፪",
    action: "ደረሰኝ አዘጋጅቷል: #REC-4092",
    details: "1,500.00 ETB መዋጮ ገቢ ተመዝግቧል [አቶ ተክለማርያም]",
  },
  {
    actor: "ቀሲስ ዮሐንስ",
    role: "Priest Yohannes",
    timeAmharic: "ጥቅምት ፳፪ ፲፩፡፲፭",
    action: "የጥምቀት ምዝገባ አጽድቋል",
    details: "ህፃን ኪዳነ ማርያም • የምስክር ወረቀት ተሰጥቷል",
  },
  {
    actor: "ዋና ኦዲተር አለሙ",
    role: "Auditor Alemu",
    timeAmharic: "ጥቅምት ፳ ፲፬፡፶",
    action: "የክምችት ቆጠራ ማመሳከሪያ አጠናቋል",
    details: "የቅዳሴ ንዋየ ቅድሳት ኦዲት ተጠናቋል (0.00 ETB ልዩነት)",
  },
];

export function LiveSecurityLogCard({ events = DEFAULT_EVENTS }: { events?: AuditEvent[] }) {
  return (
    <div className="rounded-xl border border-[#E4E2DF] bg-white p-4.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E2DF] pb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            የደህንነት ክትትል / SECURITY LOG
          </div>
          <h3 className="text-[14px] font-bold text-slate-800">
            የቅርብ ጊዜ የኦዲት መዝገብ
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ቀጥታ (Live)</span>
        </div>
      </div>

      {/* Events timeline */}
      <div className="divide-y divide-slate-100 py-2">
        {events.map((event, i) => (
          <div key={i} className="py-2.5 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800">
                {event.actor}{" "}
                <span className="font-medium text-slate-500">({event.role})</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {event.timeAmharic}
              </span>
            </div>
            <div className="text-[12px] font-semibold text-[#7A1C2E]">
              {event.action}
            </div>
            <div className="text-[11px] text-slate-600 line-clamp-1">
              {event.details}
            </div>
          </div>
        ))}
      </div>

      {/* View full audit log button */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          href="/audit-logs"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 py-2 text-[12px] font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#7A1C2E]"
        >
          <ShieldCheck size={14} />
          <span>ሙሉ የኦዲት መዝገብ ይመልከቱ</span>
        </Link>
      </div>
    </div>
  );
}
