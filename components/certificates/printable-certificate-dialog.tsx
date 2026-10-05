"use client";

import * as React from "react";
import {
  X,
  Printer,
  Sliders,
  RotateCcw,
  Upload,
  Info,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import type { ApiCertificateRequest } from "./certificate-table";

interface PrintableCertificateDialogProps {
  request: ApiCertificateRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FieldPosition {
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
}

interface CertificateFieldData {
  certificateNo: string;
  fullName: string;
  christianName: string;
  spouseName?: string;
  spouseChristianName?: string;
  dateOfBirth?: string;
  sacramentDate: string;
  issueDate: string;
  officiatingPriest: string;
  godparentOrWitness: string;
  churchName: string;
}

export function PrintableCertificateDialog({
  request,
  open,
  onOpenChange,
}: PrintableCertificateDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  // Pre-printed paper mode: hides background image during print so only text is printed
  const [printOnPreprintedPaper, setPrintOnPreprintedPaper] = React.useState(true);
  const [showCalibrationControls, setShowCalibrationControls] = React.useState(false);
  const [customTemplateUrl, setCustomTemplateUrl] = React.useState<string | null>(null);

  // Calibration offsets (in millimeters for fine-tuning physical printer alignment)
  const [globalOffsetX, setGlobalOffsetX] = React.useState(0);
  const [globalOffsetY] = React.useState(0);
  const [fontSizeScale, setFontSizeScale] = React.useState(100);

  // Form field state (pre-filled with member & request data, fully editable before print)
  const [formData, setFormData] = React.useState<CertificateFieldData>({
    certificateNo: "",
    fullName: "",
    christianName: "",
    spouseName: "",
    spouseChristianName: "",
    dateOfBirth: "",
    sacramentDate: "",
    issueDate: "",
    officiatingPriest: "",
    godparentOrWitness: "",
    churchName: "ብርሃነ ገነት ቅድስት ማርያም ቤተ ክርስቲያን (Birhane Genet St. Mary Church)",
  });

  // Populate data when request changes
  React.useEffect(() => {
    if (!request) return;

    const member = request.member;
    const memberName = `${member.firstName} ${member.lastName}`;
    const today = new Date().toLocaleDateString(isAmharic ? "am-ET" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isWedding = request.type === "Marriage";

    setFormData({
      certificateNo: `BGSM-${request.type.slice(0, 3).toUpperCase()}-${request.id.slice(0, 6).toUpperCase()}`,
      fullName: memberName,
      christianName: (member as unknown as { christianName?: string }).christianName || "ወልደ ማርያም",
      spouseName: isWedding ? "ወለተ ጊዮርጊስ / ወይዘሮ አልማዝ አበበ" : undefined,
      spouseChristianName: isWedding ? "ወለተ ጊዮርጊስ" : undefined,
      dateOfBirth: (member as unknown as { dateOfBirth?: string }).dateOfBirth
        ? new Date((member as unknown as { dateOfBirth: string }).dateOfBirth).toLocaleDateString()
        : "",
      sacramentDate: (member as unknown as { baptizedDate?: string }).baptizedDate
        ? new Date((member as unknown as { baptizedDate: string }).baptizedDate).toLocaleDateString()
        : today,
      issueDate: today,
      officiatingPriest: "ቀሲስ ቴዎድሮስ ኃይሌ (Kesis Tewodros Haile)",
      godparentOrWitness: isWedding
        ? "አቶ በቀለ ደስታ / ወ/ሮ ስንዱ ታደሰ (Witnesses)"
        : "ወ/ሮ የሺእመቤት ተሰማ (Godparent / የክርስትና እናት)",
      churchName: "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን — የብርሃነ ገነት ቅድስት ማርያም ቤተክርስቲያን",
    });
  }, [request, isAmharic]);

  if (!open || !request) return null;

  const isWedding = request.type === "Marriage";
  const defaultTemplatePath = isWedding
    ? "/certificates/wedding-template.png"
    : "/certificates/baptism-template.png";
  const activeTemplateSrc = customTemplateUrl || defaultTemplatePath;

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomTemplateUrl(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      {/* Outer Modal Container */}
      <div className="relative flex max-h-[96vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-surface shadow-2xl">
        
        {/* Header (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background-alt/50 px-5 py-3.5 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
              <Printer size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-text-primary">
                {isWedding
                  ? (isAmharic ? "የተክሊል / የጋብቻ ምስክር ወረቀት ማተሚያ" : "Holy Matrimony Certificate Printer")
                  : (isAmharic ? "የጥምቀት ምስክር ወረቀት ማተሚያ" : "Holy Baptism Certificate Printer")}
              </h2>
              <p className="text-[12px] text-text-secondary">
                {isAmharic
                  ? "በቅድመ-የታተመ የቤተክርስቲያን ወረቀት ላይ ወይም በሙሉ ፎርም በቀጥታ ያትሙ"
                  : "Print directly onto pre-printed church certificate paper or full template"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalibrationControls(!showCalibrationControls)}
              icon={<Sliders size={14} />}
            >
              {isAmharic ? "አሰላለፍ አስተካክል" : "Align / Calibrate"}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer size={15} />}
              className="bg-gold text-surface-dark hover:bg-gold-light"
            >
              {isAmharic ? "አትም (Print)" : "Print Certificate"}
            </Button>

            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar & Options Strip (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface px-5 py-2.5 text-[12.5px] print:hidden">
          {/* Mode Switcher */}
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 font-medium text-text-primary">
              <input
                type="checkbox"
                checked={printOnPreprintedPaper}
                onChange={(e) => setPrintOnPreprintedPaper(e.target.checked)}
                className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
              />
              <span>
                {isAmharic
                  ? "በቅድመ-የታተመ ወረቀት ላይ አትም (ጽሑፍ ብቻ በወረቀቱ ክፍት ቦታዎች ላይ ያርፋል)"
                  : "Print onto pre-printed paper (Overlay text into blank spaces only)"}
              </span>
            </label>
          </div>

          {/* Upload Temporary Image */}
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11.5px] font-medium text-text-secondary transition-colors hover:bg-background-alt hover:text-text-primary">
              <Upload size={13} />
              <span>{isAmharic ? "የፎርም ፎቶ ቀይር/ጫን" : "Upload Template Image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {customTemplateUrl && (
              <button
                onClick={() => setCustomTemplateUrl(null)}
                className="text-[11px] text-danger hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>
        </div>

        {/* Calibration & Info Panel (Expandable, Hidden during print) */}
        {showCalibrationControls && (
          <div className="border-b border-border bg-background-alt/40 p-4 text-[12.5px] animate-in slide-in-from-top-2 duration-150 print:hidden">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-[11.5px] font-medium text-text-secondary">
                  {isAmharic ? "አግድም ማስተካከያ (X Offset)" : "Horizontal Offset (X)"}: {globalOffsetX}mm
                </label>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={globalOffsetX}
                  onChange={(e) => setGlobalOffsetX(Number(e.target.value))}
                  className="mt-1 w-full accent-gold"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-text-secondary">
                  {isAmharic ? "የፊደል መጠን (Font Scale)" : "Font Scale"}: {fontSizeScale}%
                </label>
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={fontSizeScale}
                  onChange={(e) => setFontSizeScale(Number(e.target.value))}
                  className="mt-1 w-full accent-gold"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGlobalOffsetX(0);
                    setFontSizeScale(100);
                  }}
                  icon={<RotateCcw size={13} />}
                >
                  {isAmharic ? "ወደ ነባሪ መልስ" : "Reset Calibration"}
                </Button>
              </div>
            </div>

            <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-text-muted">
              <Info size={14} className="shrink-0 text-gold" />
              <span>
                {isAmharic
                  ? "የእርስዎ አካላዊ ሰርቲፊኬት ምስል በ '/public/certificates/baptism-template.png' ወይም 'wedding-template.png' ውስጥ ይቀመጣል። ከላይ ባሉት ማስመሪያዎች የጽሑፉን አቀማመጥ ከወረቀትዎ ክፍት ቦታዎች ጋር መግጠም ይችላሉ።"
                  : "Template image file location: '/public/certificates/baptism-template.png' or 'wedding-template.png'. Adjust sliders to align text with your pre-printed paper lines."}
              </span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto bg-background-alt/60 p-4 sm:p-6">
          <div className="mx-auto flex flex-col items-center">
            
            {/* The Certificate A4 Canvas */}
            <div
              id="certificate-print-sheet"
              style={{
                transform: `translateX(${globalOffsetX}mm) translateY(${globalOffsetY}mm)`,
                fontSize: `${(fontSizeScale / 100) * 14}px`,
              }}
              className={`relative mx-auto w-full max-w-[900px] aspect-[1.414/1] rounded-lg border border-border shadow-lg transition-all duration-150 overflow-hidden ${
                printOnPreprintedPaper ? "print:bg-transparent print:border-none print:shadow-none" : "bg-white text-black"
              }`}
            >
              {/* Template Image Background */}
              {/* On screen: always visible for visual alignment reference. */}
              {/* In print mode: hidden if printing on pre-printed paper, visible if printing full template */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity ${
                  printOnPreprintedPaper ? "print:hidden opacity-90" : "opacity-100"
                }`}
                style={{
                  backgroundImage: `url(${activeTemplateSrc})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              >
                {/* Fallback watermark/visual guide if image hasn't been placed in public/certificates yet */}
                <div className="absolute inset-0 flex flex-col items-center justify-between p-8 border-8 border-double border-amber-800/30 bg-amber-50/15">
                  <div className="text-center">
                    <p className="text-[12px] font-semibold text-amber-900/60 uppercase tracking-widest">
                      የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን
                    </p>
                    <p className="text-[10px] text-amber-800/50">
                      የብርሃነ ገነት ቅድስት ማርያም ቤተክርስቲያን
                    </p>
                  </div>
                  <div className="text-center opacity-30">
                    <p className="text-[28px] font-serif font-bold text-amber-950">
                      {isWedding ? "የተክሊል ምስክር ወረቀት" : "የጥምቀት ምስክር ወረቀት"}
                    </p>
                  </div>
                  <div className="text-[9px] text-amber-800/40">
                    Birhane Genet St. Mary Church • Canonical Certificate Ledger
                  </div>
                </div>
              </div>

              {/* OVERLAY FIELD SYSTEM: Placed exactly where church certificate blanks reside */}
              <div className="relative z-10 h-full w-full p-8 flex flex-col justify-between">
                
                {/* Top Section: Registry & Header */}
                <div className="flex justify-between items-start pt-2">
                  <div className="text-left font-serif">
                    <span className="text-[11px] font-bold text-amber-950/70 print:text-black">
                      {isAmharic ? "መለያ ቁጥር፦ " : "No: "}
                    </span>
                    <span className="font-mono font-bold text-[13px] text-primary print:text-black underline decoration-dotted">
                      {formData.certificateNo}
                    </span>
                  </div>

                  <div className="text-right font-serif">
                    <span className="text-[11px] font-bold text-amber-950/70 print:text-black">
                      {isAmharic ? "ቀን፦ " : "Date: "}
                    </span>
                    <span className="font-serif font-bold text-[12px] text-primary print:text-black underline decoration-dotted">
                      {formData.issueDate}
                    </span>
                  </div>
                </div>

                {/* Middle Content Section: Dynamic text that sits on the printed paper's lines */}
                <div className="my-auto space-y-4 px-6 text-center font-serif text-[13.5px] leading-relaxed text-slate-900 print:text-black">
                  
                  {isWedding ? (
                    // Wedding / Holy Matrimony Certificate Text Flow
                    <div className="space-y-3.5">
                      <p className="leading-loose">
                        {isAmharic ? "ሙሽራው አቶ፦ " : "Groom: "}
                        <span className="font-bold text-[15px] px-2 underline decoration-black decoration-1">
                          {formData.fullName}
                        </span>
                        {" ("}
                        <span className="font-semibold text-[13.5px] text-amber-900 print:text-black">
                          {formData.christianName}
                        </span>
                        {") "}
                        {isAmharic ? "እና ሙሽሪት ወ/ሮ፦ " : "and Bride: "}
                        <span className="font-bold text-[15px] px-2 underline decoration-black decoration-1">
                          {formData.spouseName || "—"}
                        </span>
                        {" ("}
                        <span className="font-semibold text-[13.5px] text-amber-900 print:text-black">
                          {formData.spouseChristianName || "—"}
                        </span>
                        {")"}
                      </p>

                      <p className="leading-loose">
                        {isAmharic
                          ? "በተቀደሰው በጋብቻ (ተክሊል) ምስጢር በዛሬው ዕለት "
                          : "have been united in the Holy Sacrament of Matrimony on "}
                        <span className="font-bold underline decoration-black px-1.5">
                          {formData.sacramentDate}
                        </span>
                        {isAmharic
                          ? " በቅድስት ቤተክርስቲያናችን ሕግና ሥርዓት መሠረት ተጋብተዋል።"
                          : " in accordance with the Holy Canons of the Church."}
                      </p>

                      <p className="leading-loose text-[12.5px]">
                        {isAmharic ? "ያጋቡት አባት ካህን፦ " : "Officiating Priest: "}
                        <span className="font-bold underline decoration-black px-1.5">
                          {formData.officiatingPriest}
                        </span>
                        {" • "}
                        {isAmharic ? "ምስክሮች፦ " : "Witnesses: "}
                        <span className="font-medium underline decoration-black px-1.5">
                          {formData.godparentOrWitness}
                        </span>
                      </p>
                    </div>
                  ) : (
                    // Baptism Certificate Text Flow
                    <div className="space-y-4">
                      <p className="leading-loose">
                        {isAmharic ? "የምዕመኑ/ኗ ሙሉ ስም፦ " : "Full Name: "}
                        <span className="font-bold text-[16px] px-3 underline decoration-black decoration-1">
                          {formData.fullName}
                        </span>
                      </p>

                      <p className="leading-loose">
                        {isAmharic ? "የክርስትና ስም፦ " : "Christian Name: "}
                        <span className="font-bold text-[15px] text-amber-950 px-3 underline decoration-black decoration-1 print:text-black">
                          {formData.christianName}
                        </span>
                        {"  "}
                        {formData.dateOfBirth && (
                          <>
                            {isAmharic ? "የትውልድ ቀን፦ " : "Date of Birth: "}
                            <span className="font-semibold px-2 underline decoration-black">
                              {formData.dateOfBirth}
                            </span>
                          </>
                        )}
                      </p>

                      <p className="leading-loose">
                        {isAmharic ? "የተጠመቁበት ቀን፦ " : "Date of Baptism: "}
                        <span className="font-bold underline decoration-black px-2">
                          {formData.sacramentDate}
                        </span>
                        {" • "}
                        {isAmharic ? "ያጠመቁት አባት ካህን፦ " : "Officiating Priest: "}
                        <span className="font-bold underline decoration-black px-2">
                          {formData.officiatingPriest}
                        </span>
                      </p>

                      <p className="leading-loose">
                        {isAmharic ? "የክርስትና አባት / እናት፦ " : "Godparent: "}
                        <span className="font-bold underline decoration-black px-2">
                          {formData.godparentOrWitness}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Signature & Seal Section */}
                <div className="grid grid-cols-3 gap-6 pt-4 text-center font-serif text-[11px] text-slate-800 print:text-black">
                  <div>
                    <div className="mx-auto w-36 border-b border-black/60 pb-1 mb-1 font-semibold">
                      {formData.officiatingPriest.split("(")[0].trim()}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-600 print:text-black">
                      {isAmharic ? "ያጠመቁት/ያጋቡት ካህን ፊርማ" : "Priest Signature"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-end">
                    <div className="h-12 w-12 rounded-full border border-dashed border-black/40 flex items-center justify-center text-[9px] text-slate-400 print:border-black/50 print:text-black">
                      {isAmharic ? "ማኅተም" : "Seal"}
                    </div>
                    <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-600 print:text-black">
                      {isAmharic ? "የቤተክርስቲያኑ ማኅተም" : "Church Seal"}
                    </span>
                  </div>

                  <div>
                    <div className="mx-auto w-36 border-b border-black/60 pb-1 mb-1 font-semibold">
                      አስተዳደር ጽ/ቤት
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-600 print:text-black">
                      {isAmharic ? "ዋና አስተዳዳሪ ፊርማ" : "Administrator Signature"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Helper under preview */}
            <p className="mt-3 text-center text-[12px] text-text-muted print:hidden">
              {isAmharic
                ? "💡 ማሳሰቢያ፦ በአታሚዎ (Printer) ቅንብር ውስጥ 'Background Graphics'ን ማጥፋት ወይም ማብራት ይችላሉ።"
                : "💡 Tip: In your browser print dialog, select Landscape A4 orientation and adjust margins to None for perfect alignment."}
            </p>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3.5 print:hidden">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {isAmharic ? "ዝጋ (Close)" : "Close"}
          </Button>

          <Button
            variant="primary"
            onClick={handlePrint}
            icon={<Printer size={16} />}
            className="bg-gold text-surface-dark hover:bg-gold-light font-semibold"
          >
            {isAmharic ? "አሁን አትም (Print Now)" : "Print Certificate"}
          </Button>
        </div>

      </div>

      {/* Global Print Stylesheet specifically for this dialog */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-sheet,
          #certificate-print-sheet * {
            visibility: visible;
          }
          #certificate-print-sheet {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          @page {
            size: landscape A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
