"use client";

import * as React from "react";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { QrCode, Award } from "lucide-react";

export interface MatrimonyRecord {
  id: string;
  folioNumber: string;
  canonicalRegNo: string;
  ceremonyDateEth: string;
  ceremonyDateGc: string;
  ceremonyType: string;

  groom: {
    fullName: string;
    fullNameEn: string;
    baptismalName: string;
    birthDatePlace: string;
    confessor: string;
  };

  bride: {
    fullName: string;
    fullNameEn: string;
    baptismalName: string;
    birthDatePlace: string;
    confessor: string;
  };

  presidingPriest: string;
  witnesses: string;
  churchName: string;
  diocese: string;
}

export const SAMPLE_MATRIMONY: MatrimonyRecord = {
  id: "MAT-2017-0038",
  folioNumber: "፳፻፲፯/፴፰",
  canonicalRegNo: "EOTC/CHG/MAT/2017/0038",
  ceremonyDateEth: "ጥቅምት ፳፬ ቀን ፳፻፲፯ ዓ.ም.",
  ceremonyDateGc: "November 3, 2024",
  ceremonyType: "ሥርዓተ ተክሊል ቅዳሴ ቁርባን",

  groom: {
    fullName: "ኃይለ ሚካኤል ተስፋዬ አያሌው",
    fullNameEn: "Hailemichael Tesfaye Ayalew",
    baptismalName: "ገብረ ማርያም",
    birthDatePlace: "መስከረም 15, 1968 • ቻግኒ",
    confessor: "መልአከ ገነት ቀሲስ እስጢፋኖስ መንገሻ",
  },

  bride: {
    fullName: "ሰላማዊት ታደሰ ወርቁ",
    fullNameEn: "Selamawit Tadese Worku",
    baptismalName: "ወለተ ኪዳን",
    birthDatePlace: "ጥቅምት 10, 1974 • ባሕር ዳር",
    confessor: "መጋቤ ሐዲስ ቀሲስ ዮሐንስ ገብሬ",
  },

  presidingPriest: "መልአከ ገነት ቀሲስ እስጢፋኖስ መንገሻ",
  witnesses: "አቶ ግርማ ወልዴ & አቶ ብርሃኑ ካሣ",
  churchName: "ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም ቤተክርስቲያን",
  diocese: "ምዕራብ ጎጃም ሀገረ ስብከት • ቻግኒ ከተማ ደብረ ብርሃን",
};

export function CanonicalNuptialCertificate({ record = SAMPLE_MATRIMONY }: { record?: MatrimonyRecord }) {
  return (
    <div className="relative mx-auto w-full max-w-[760px] rounded-lg border-4 border-[#C69214]/60 bg-[#FFFDF8] p-6 text-slate-900 shadow-elevated font-sans print:shadow-none print:border-2">
      {/* Intricate Inner Ornamental Border */}
      <div className="rounded border border-[#7A1C2E]/40 p-4 sm:p-6 bg-gradient-to-b from-[#FFFDF8] via-[#FAF8F5] to-[#FFFDF8]">
        {/* 1. Trinitarian Invocations */}
        <div className="text-center">
          <div className="flex justify-center mb-1 text-[#C69214]">
            <EthiopicCross size={28} variant="gold" />
          </div>
          <div className="font-serif text-[13.5px] font-bold tracking-wide text-[#7A1C2E]">
            «በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን»
          </div>
          <div className="mt-0.5 text-[9.5px] font-medium uppercase tracking-widest text-slate-500">
            IN THE NAME OF THE FATHER, AND OF THE SON, AND OF THE HOLY SPIRIT, ONE GOD, AMEN.
          </div>
        </div>

        {/* 2. Church & Diocese Hierarchy */}
        <div className="mt-3 text-center">
          <div className="text-[12px] font-bold text-slate-800">
            የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን
          </div>
          <div className="text-[10.5px] text-slate-600">
            {record.diocese}
          </div>
          <div className="mt-0.5 font-serif text-[14.5px] font-extrabold text-[#7A1C2E]">
            {record.churchName}
          </div>
        </div>

        {/* 3. Certificate Ribbon Banner */}
        <div className="mt-3.5 overflow-hidden rounded bg-[#7A1C2E] py-2 px-3 text-center text-white shadow-sm">
          <h2 className="font-serif text-[15px] font-extrabold tracking-wide">
            የተክሊልና የቅዱስ ጋብቻ ምስክር ወረቀት
          </h2>
          <div className="text-[9.5px] font-semibold tracking-wider uppercase text-white/80">
            CERTIFICATE OF HOLY MATRIMONY & CANONICAL NUPTIAL BLESSING
          </div>
        </div>

        {/* 4. Folio & Scripture Ribbon */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 border-b border-[#C69214]/30 pb-2 text-[11px]">
          <div>
            <span className="text-slate-500">መዝገብ ቁጥር: </span>
            <span className="font-bold font-mono text-[#7A1C2E]">{record.folioNumber}</span>
            <span className="mx-1 text-slate-300">|</span>
            <span className="font-mono text-slate-600">{record.canonicalRegNo}</span>
          </div>
          <div className="font-serif text-[11.5px] font-bold text-[#C69214]">
            «እግዚአብሔር ያጣመረውን ሰው አይለየው» <span className="font-sans font-normal text-slate-600">— ማቴ. ፲፱:፮ (Matt. 19:6)</span>
          </div>
        </div>

        {/* 5. Groom & Bride Two-Column Ledger */}
        <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Groom Box */}
          <div className="rounded-lg border border-[#C69214]/30 bg-white/70 p-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 text-[11px]">
              <span className="font-bold text-[#7A1C2E]">♂ ሙሽራው (Groom)</span>
              <span className="text-[9.5px] uppercase font-bold text-slate-400">EOTC GROOM LEDGER</span>
            </div>
            <div className="mt-2 space-y-1.5 text-[11.5px]">
              <div>
                <span className="text-[10px] text-slate-500 block">ሙሉ ስም (Full Legal Name):</span>
                <span className="font-bold text-slate-900">{record.groom.fullName}</span>
                <span className="block text-[10px] text-slate-500">{record.groom.fullNameEn}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-500 block">የክርስትና ስም:</span>
                  <span className="font-bold text-[#7A1C2E]">{record.groom.baptismalName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">የትውልድ ቀንና ቦታ:</span>
                  <span className="font-medium text-slate-800">{record.groom.birthDatePlace}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">የንስሐ አባት (Spiritual Confessor):</span>
                <span className="font-semibold text-slate-800">{record.groom.confessor}</span>
              </div>
            </div>
          </div>

          {/* Bride Box */}
          <div className="rounded-lg border border-[#C69214]/30 bg-white/70 p-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 text-[11px]">
              <span className="font-bold text-[#7A1C2E]">♀ ሙሽሪት (Bride)</span>
              <span className="text-[9.5px] uppercase font-bold text-slate-400">EOTC BRIDE LEDGER</span>
            </div>
            <div className="mt-2 space-y-1.5 text-[11.5px]">
              <div>
                <span className="text-[10px] text-slate-500 block">ሙሉ ስም (Full Legal Name):</span>
                <span className="font-bold text-slate-900">{record.bride.fullName}</span>
                <span className="block text-[10px] text-slate-500">{record.bride.fullNameEn}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-500 block">የክርስትና ስም:</span>
                  <span className="font-bold text-[#7A1C2E]">{record.bride.baptismalName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">የትውልድ ቀንና ቦታ:</span>
                  <span className="font-medium text-slate-800">{record.bride.birthDatePlace}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">የንስሐ አባት (Spiritual Confessor):</span>
                <span className="font-semibold text-slate-800">{record.bride.confessor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Solemn Nuptial Blessing Details */}
        <div className="mt-3.5 grid grid-cols-1 gap-2 border-t border-b border-slate-200/80 py-2.5 sm:grid-cols-3 text-[11px]">
          <div>
            <span className="text-[10px] text-slate-500 block">የተከለሉበት ቀን (DATE OF CROWN):</span>
            <span className="font-bold text-[#7A1C2E]">{record.ceremonyDateEth}</span>
            <span className="block text-[9.5px] text-slate-400">{record.ceremonyDateGc}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">የሥርዓቱ ዓይነት (CANONICAL RITE):</span>
            <span className="font-bold text-slate-800">{record.ceremonyType}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">የተክሊል ምስክሮች (WITNESSES):</span>
            <span className="font-medium text-slate-800">{record.witnesses}</span>
          </div>
        </div>

        {/* 7. Signatures & Official Seals */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 pt-1">
          <div className="text-center">
            <div className="h-9 border-b border-slate-300 w-32 mx-auto flex items-end justify-center pb-1 text-[10px] text-slate-400">
              [ ፊርማ ]
            </div>
            <div className="mt-1 text-[10.5px] font-bold text-slate-800">{record.presidingPriest}</div>
            <div className="text-[9.5px] text-slate-500">የሥርዓቱ መሪ ካህን</div>
          </div>

          {/* Official EOTC Church Seal Stamp */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#7A1C2E] text-[#7A1C2E] bg-rose-50/50 p-1 text-center">
              <Award size={24} />
            </div>
            <span className="mt-1 text-[9px] font-extrabold uppercase text-[#7A1C2E]">የቤተክርስቲያን ማህተም</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-slate-300 bg-white p-1">
              <QrCode size={38} className="text-slate-800" />
            </div>
            <div className="text-left text-[9.5px] text-slate-500 leading-tight">
              <span className="font-bold block text-slate-700">ደህንነቱ የተረጋገጠ</span>
              EOTC Canonical QR<br />
              Valid Church ID
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
