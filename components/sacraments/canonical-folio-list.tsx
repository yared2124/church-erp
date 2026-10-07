"use client";

import * as React from "react";
import { Search, CheckCircle2, ShieldCheck, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FolioItem {
  id: string;
  code: string;
  typeBadge: string;
  statusBadge: string;
  groomText: string;
  brideText: string;
  priestText: string;
  dateEth: string;
  isBurial?: boolean;
}

const SAMPLE_FOLIOS: FolioItem[] = [
  {
    id: "MAT-2017-0038",
    code: "MAT-2017-0038",
    typeBadge: "ሥርዓተ ተክሊል",
    statusBadge: "በሥርዓተ ቤተክርስቲያን የተፈጸመ",
    groomText: "ሙሽራ፡ ኃይለ ሚካኤል ተስፋዬ አያሌው (ክ/ስም፡ ገብረ ማርያም)",
    brideText: "ሙሽሪት፡ ሰላማዊት ታደሰ ወርቁ (ክ/ስም፡ ወለተ ኪዳን)",
    priestText: "ካህን፡ መልአከ ገነት ቀሲስ እስጢፋኖስ",
    dateEth: "ጥቅምት ፳፬, ፳፻፲፯ ዓ.ም.",
  },
  {
    id: "MAT-2017-0037",
    code: "MAT-2017-0037",
    typeBadge: "ሥርዓተ ተክሊል",
    statusBadge: "የጸደቀ",
    groomText: "ዮሴፍ ዓለሙ (ወልደ ጊዮርጊስ)",
    brideText: "ብርሃን ካሣ (ወለተ ሐና)",
    priestText: "ካህን፡ መጋቤ ሐዲስ ቀሲስ ዮሐንስ",
    dateEth: "ጥቅምት ፲፱, ፳፻፲፯ ዓ.ም.",
  },
  {
    id: "BUR-2017-0029",
    code: "BUR-2017-0029",
    typeBadge: "ፍትሐትና የቀብር መዝገብ",
    statusBadge: "በክብር ያረፉ",
    groomText: "ሟች፡ እማሆይ ወለተ ጻድቅ አድማሱ",
    brideText: "መቃብር ቦታ፡ በቅዱስ ሚካኤል Block B, Plot 42",
    priestText: "ካህን፡ መጋቤ ሐዲስ ቀሲስ ዮሐንስ",
    dateEth: "ጥቅምት ፲፪, ፳፻፲፯ ዓ.ም.",
    isBurial: true,
  },
  {
    id: "MAT-2017-0036",
    code: "MAT-2017-0036",
    typeBadge: "ሥርዓተ ተክሊል",
    statusBadge: "የተከናወነ",
    groomText: "ዳዊት በቀለ (ገብረ ክርስቶስ)",
    brideText: "ምርት ፍቃዱ (ወለተ ማርያም)",
    priestText: "ካህን፡ መልአከ ገነት ቀሲስ እስጢፋኖስ",
    dateEth: "መስከረም ፳፭, ፳፻፲፯ ዓ.ም.",
  },
];

interface CanonicalFolioListProps {
  folios?: FolioItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function CanonicalFolioList({
  folios = SAMPLE_FOLIOS,
  selectedId,
  onSelect,
}: CanonicalFolioListProps) {
  const [filter, setFilter] = React.useState<"all" | "matrimony" | "burial">("all");
  const [search, setSearch] = React.useState("");

  const filtered = folios.filter((item) => {
    if (filter === "matrimony" && item.isBurial) return false;
    if (filter === "burial" && !item.isBurial) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.groomText.toLowerCase().includes(q) ||
        item.brideText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-3.5">
      {/* Search Input & Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="በቁጥር፣ በሙሽራው/ሙሽሪት ስም፣ በክርስትና ስም..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[12px] placeholder:text-slate-400 focus:border-[#7A1C2E] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-md px-2.5 py-1 transition-colors",
              filter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            ሁሉም (All)
          </button>
          <button
            type="button"
            onClick={() => setFilter("matrimony")}
            className={cn(
              "rounded-md px-2.5 py-1 transition-colors",
              filter === "matrimony" ? "bg-[#7A1C2E] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            የተክሊል ጋብቻ (38)
          </button>
          <button
            type="button"
            onClick={() => setFilter("burial")}
            className={cn(
              "rounded-md px-2.5 py-1 transition-colors",
              filter === "burial" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            ፍትሐት (29)
          </button>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-500 font-normal">
            ፳፻፲፯ ዓ.ም.
          </span>
        </div>
      </div>

      {/* Record Cards List */}
      <div className="space-y-2">
        {filtered.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "cursor-pointer rounded-xl border p-3 transition-all",
                isSelected
                  ? "border-[#7A1C2E] bg-white shadow-md ring-1 ring-[#7A1C2E]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-[#7A1C2E] px-2 py-0.5 font-mono font-bold text-white text-[10px]">
                    {item.code}
                  </span>
                  <span className="font-bold text-slate-800">• {item.typeBadge}</span>
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {item.statusBadge}
                </span>
              </div>

              <div className="mt-2 space-y-1 text-[12px]">
                <div className="font-bold text-slate-900 leading-snug">{item.groomText}</div>
                <div className="text-slate-700 leading-snug">{item.brideText}</div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10.5px] text-slate-500">
                <span className="flex items-center gap-1 truncate">
                  <User size={12} className="text-[#C69214]" />
                  <span>{item.priestText}</span>
                </span>
                <span className="shrink-0 font-medium">{item.dateEth}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Canonical Clearance Card matching screenshot */}
      <div className="rounded-xl border border-[#C69214]/40 bg-[#FFFDF8] p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#C69214]/20 pb-2">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
            <ShieldCheck size={16} className="text-[#7A1C2E]" />
            <span>ቀኖናዊ የምርመራ ማህደር (Canonical Clearance)</span>
          </div>
          <span className="rounded bg-[#FDF8ED] border border-[#C69214]/40 px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-[#9A6F0A]">
            FOLIO VERIFIED
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded border border-slate-200/80 bg-white p-2">
            <span className="text-[10px] text-slate-400 block">መጽሐፈ ተክሊል ገጽ (Book & Page):</span>
            <span className="font-bold text-slate-800">መጽሐፈ ተክሊል ፯፣ ገጽ ፲፪ ፳፪</span>
          </div>
          <div className="rounded border border-slate-200/80 bg-white p-2">
            <span className="text-[10px] text-slate-400 block">የንስሐ አባት ፈቃድ (Confessor):</span>
            <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>ተረጋግጧል (Approved)</span>
            </span>
          </div>
          <div className="rounded border border-slate-200/80 bg-white p-2">
            <span className="text-[10px] text-slate-400 block">የሙሽራው ወላጆች (Groom&apos;s Parents):</span>
            <span className="font-medium text-slate-800">አቶ ተስፋዬ አያሌው / ወ/ሮ አለምነሽ</span>
          </div>
          <div className="rounded border border-slate-200/80 bg-white p-2">
            <span className="text-[10px] text-slate-400 block">የሙሽሪት ወላጆች (Bride&apos;s Parents):</span>
            <span className="font-medium text-slate-800">አቶ ታደሰ ወርቁ / ወ/ሮ ጥሩነሽ ኃይሌ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
