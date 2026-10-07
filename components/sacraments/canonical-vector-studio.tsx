"use client";

import * as React from "react";
import Link from "next/link";
import {
  Printer,
  Download,
  QrCode,
  Share2,
  Plus,
  ZoomIn,
  Layers,
  Heart,
  Cross,
  Flame,
} from "lucide-react";
import { CanonicalNuptialCertificate, SAMPLE_MATRIMONY } from "./canonical-nuptial-certificate";
import { CanonicalFolioList } from "./canonical-folio-list";
import { cn } from "@/lib/utils";

export function CanonicalVectorStudio() {
  const [selectedFolioId, setSelectedFolioId] = React.useState("MAT-2017-0038");
  const [activeTab, setActiveTab] = React.useState<"baptism" | "matrimony" | "burial">("matrimony");

  return (
    <div className="space-y-4">
      {/* 1. Breadcrumbs & Top Action Bar matching Image 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E4E2DF] bg-white p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span>ምሥጢራተ ቤተክርስቲያን (SACRAMENTS)</span>
            <span>&gt;</span>
            <span className="text-[#7A1C2E]">ተክሊልና ጋብቻ / ፍትሐት መዝገብ (MATRIMONY & CHRISTIAN BURIAL)</span>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="font-serif text-[18px] font-bold text-slate-900">
              የተክሊልና የፍትሐት ቀኖናዊ መዛግብት
            </h1>
            <span className="rounded bg-[#FDF8ED] border border-[#C69214]/40 px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#9A6F0A]">
              Sacramental Canonical Vector Studio
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A1C2E] px-3.5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-[#631625]"
          >
            <Plus size={14} />
            <span>+ አዲስ የተክሊል ጋብቻ መዝግብ</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus size={14} />
            <span>+ አዲስ የፍትሐት መዝገብ</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <QrCode size={14} />
            <span>ማረጋገጫ (Verify QR)</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <Share2 size={14} />
            <span>ሪፖርት ላክ</span>
          </button>
        </div>
      </div>

      {/* 2. Canonical Tabs Bar matching Image 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E2DF] bg-white px-4 py-2.5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <Link
            href="/sacraments/baptisms"
            onClick={() => setActiveTab("baptism")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition-all",
              activeTab === "baptism"
                ? "bg-[#7A1C2E] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Flame size={14} />
            <span>ጥምቀት (Holy Baptism)</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] text-slate-800 font-extrabold">
              142
            </span>
          </Link>

          <Link
            href="/sacraments/matrimony"
            onClick={() => setActiveTab("matrimony")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition-all",
              activeTab === "matrimony"
                ? "bg-[#7A1C2E] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Heart size={14} />
            <span>ተክሊልና ጋብቻ (Holy Matrimony)</span>
            <span className="rounded-full bg-white/20 px-2 py-0.2 text-[10px] text-white font-extrabold">
              38
            </span>
          </Link>

          <Link
            href="/sacraments/burials"
            onClick={() => setActiveTab("burial")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition-all",
              activeTab === "burial"
                ? "bg-[#7A1C2E] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Cross size={14} />
            <span>ፍትሐትና የቀብር ሥነ ሥርዓት (Christian Burial & Memorial)</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] text-slate-800 font-extrabold">
              29
            </span>
          </Link>
        </div>

        <span className="text-[11px] font-medium text-slate-500 hidden xl:inline-block">
          ቀኖናዊ የምስክር ወረቀት ስቱዲዮ (Canonical Print Engine v4.2)
        </span>
      </div>

      {/* 3. Split Screen: Left ~40% / Right ~60% */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Folio Records List & Canonical Clearance */}
        <div className="lg:col-span-5 space-y-4">
          <CanonicalFolioList
            selectedId={selectedFolioId}
            onSelect={(id) => setSelectedFolioId(id)}
          />
        </div>

        {/* Right Column: High-Fidelity A4 Certificate Print Preview Canvas */}
        <div className="lg:col-span-7 space-y-3">
          {/* Certificate Print Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A1C2E] px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-[#631625]"
              >
                <Printer size={14} />
                <span>A4 Vector Print (እትም)</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-100"
              >
                <Layers size={14} />
                <span>Overlay Mode (በቅጽ ላይ እትም)</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-100"
              >
                <Download size={14} />
                <span>PDF አውርድ</span>
              </button>
            </div>

            <button
              type="button"
              aria-label="Zoom preview"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Certificate Canvas */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-[#EFECE6]/40 p-3 sm:p-5">
            <CanonicalNuptialCertificate />
          </div>
        </div>
      </div>
    </div>
  );
}
