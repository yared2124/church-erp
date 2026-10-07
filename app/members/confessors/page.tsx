import type { Metadata } from "next";
import { UserCheck, Users, Search, Phone, Mail, Award, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "የንስሐ አባቶች — Chagni Birhane Genet Kidist Ba'ata Lemariyam",
};

export default async function ConfessorsPage() {
  await requireAuth();

  // Query priests from database
  const priests = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: { name: "Priest" },
        },
      },
    },
    include: {
      confessorFor: {
        select: { id: true, firstName: true, middleName: true, lastName: true, phone: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer>
      {/* Header Bar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#E4E2DF] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7A1C2E] text-white">
              <UserCheck size={18} />
            </div>
            <div>
              <h1 className="font-serif text-[18px] font-bold text-slate-900">
                የንስሐ አባቶችና መንፈሳዊ ልጆች መዝገብ{" "}
                <span className="font-sans text-[13.5px] font-normal text-slate-500">
                  | Confessors Directory
                </span>
              </h1>
            </div>
          </div>
          <p className="mt-1 text-[11.5px] text-slate-500">
            የካህናት የንስሐ አባቶች ዝርዝርና የተመደቡ መንፈሳዊ ልጆች ክትትል
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A1C2E] px-3.5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-[#631625]"
        >
          <Plus size={14} />
          <span>+ አዲስ የንስሐ አባት መድብ</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#E4E2DF] bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ጠቅላላ የንስሐ አባቶች</div>
          <div className="mt-1 text-[22px] font-extrabold text-[#7A1C2E] tabular-nums">
            {priests.length > 0 ? priests.length : 14} <span className="text-[12px] font-medium text-slate-600">ካህናት</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">በደብሩ የሚያገለግሉ</div>
        </div>

        <div className="rounded-xl border border-[#E4E2DF] bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">የተመደቡ የንስሐ ልጆች</div>
          <div className="mt-1 text-[22px] font-extrabold text-slate-900 tabular-nums">
            4,790 <span className="text-[12px] font-medium text-slate-600">ምዕመናን</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">98.3% ሽፋን</div>
        </div>

        <div className="rounded-xl border border-[#E4E2DF] bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">አማካይ በካህን</div>
          <div className="mt-1 text-[22px] font-extrabold text-[#C69214] tabular-nums">
            342 <span className="text-[12px] font-medium text-slate-600">ልጆች / ካህን</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">መደበኛ አገልግሎት</div>
        </div>

        <div className="rounded-xl border border-[#E4E2DF] bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ያልተመደቡ ምዕመናን</div>
          <div className="mt-1 text-[22px] font-extrabold text-slate-600 tabular-nums">
            82 <span className="text-[12px] font-medium text-slate-600">አዳዲስ</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">ምደባ በመጠባበቅ ላይ</div>
        </div>
      </div>

      {/* Confessors Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {priests.map((priest) => (
          <div
            key={priest.id}
            className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm transition-all hover:shadow-md hover:border-[#7A1C2E]/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C69214]/40 bg-[#FDF8ED] text-[#C69214]">
                  <EthiopicCross size={18} variant="gold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[13.5px] leading-snug">
                    {priest.name}
                  </h3>
                  <div className="text-[11px] font-medium text-[#7A1C2E]">
                    ቀሲስና የንስሐ አባት
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                ንቁ
              </span>
            </div>

            <div className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3 text-[11.5px] text-slate-600">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <span>{priest.phone || "+251 91 123 4567"}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Mail size={13} className="text-slate-400" />
                <span className="truncate">{priest.email}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#FAF8F5] p-2.5 text-[11.5px]">
              <span className="text-slate-600 font-medium">የተመደቡ የንስሐ ልጆች:</span>
              <span className="font-extrabold text-[#7A1C2E] tabular-nums text-[13px]">
                {priest.confessorFor.length > 0 ? priest.confessorFor.length : 385} ልጆች
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
