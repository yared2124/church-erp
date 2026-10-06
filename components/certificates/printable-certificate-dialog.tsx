"use client";

import * as React from "react";
import {
  X,
  Printer,
  Sliders,
  RotateCcw,
  Edit3,
  Eye,
  Maximize2,
  Minimize2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type { ApiCertificateRequest } from "./certificate-table";

interface PrintableCertificateDialogProps {
  request: ApiCertificateRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WeddingFieldData {
  groomAmharic: string;
  groomEnglish: string;
  groomNatAmharic: string;
  groomNatEnglish: string;
  brideAmharic: string;
  brideEnglish: string;
  brideNatAmharic: string;
  brideNatEnglish: string;
  priestAmharic: string;
  priestEnglish: string;
  dateAmharic: string;
  dateEnglish: string;
  witness1Amharic: string;
  witness1English: string;
  witness2Amharic: string;
  witness2English: string;
  witness3Amharic: string;
  witness3English: string;
}

interface BaptismFieldData {
  regNo: string;
  issueDateAmharic: string;
  issueDateEnglish: string;
  childNameAmharic: string;
  childNameEnglish: string;
  sexAmharic: string;
  sexEnglish: string;
  placeOfBirthAmharic: string;
  placeOfBirthEnglish: string;
  dobAmharic: string;
  dobEnglish: string;
  timeOfBirth: string;
  baptismDateAmharic: string;
  baptismDateEnglish: string;
  penitenceFatherAmharic: string;
  penitenceFatherEnglish: string;
  fatherNameAmharic: string;
  fatherNameEnglish: string;
  fatherAge: string;
  fatherResidence: string;
  motherNameAmharic: string;
  motherNameEnglish: string;
  motherAge: string;
  motherResidence: string;
  registeredBy: string;
  approvedBy: string;
}

export function PrintableCertificateDialog({
  request,
  open,
  onOpenChange,
}: PrintableCertificateDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  // Tab: "preview" | "edit" | "calibrate"
  const [activeTab, setActiveTab] = React.useState<"preview" | "edit" | "calibrate">("preview");

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Mode: Full Digital Certificate vs Text Only (for feeding pre-printed church stationery into printer)
  const [printOnPreprintedStationery, setPrintOnPreprintedStationery] = React.useState(false);

  // Calibration offsets (in millimeters for physical printer alignment)
  const [globalOffsetX, setGlobalOffsetX] = React.useState(0);
  const [globalOffsetY, setGlobalOffsetY] = React.useState(0);
  const [fontSizeScale, setFontSizeScale] = React.useState(100);

  // Marriage Certificate Fields
  const [weddingData, setWeddingData] = React.useState<WeddingFieldData>({
    groomAmharic: "",
    groomEnglish: "",
    groomNatAmharic: "ኢትዮጵያዊ",
    groomNatEnglish: "Ethiopian",
    brideAmharic: "",
    brideEnglish: "",
    brideNatAmharic: "ኢትዮጵያዊት",
    brideNatEnglish: "Ethiopian",
    priestAmharic: "ቀሲስ ቴዎድሮስ ኃይሌ",
    priestEnglish: "Kesis Tewodros Haile",
    dateAmharic: "",
    dateEnglish: "",
    witness1Amharic: "አቶ በቀለ ደስታ",
    witness1English: "Ato Bekele Desta",
    witness2Amharic: "አቶ ግርማ ወልዴ",
    witness2English: "Ato Girma Wolde",
    witness3Amharic: "ወ/ሮ ስንዱ ታደሰ",
    witness3English: "W/ro Sindu Tadesse",
  });

  // Birth / Baptism Certificate Fields
  const [baptismData, setBaptismData] = React.useState<BaptismFieldData>({
    regNo: "BGSM/042/16",
    issueDateAmharic: "",
    issueDateEnglish: "",
    childNameAmharic: "",
    childNameEnglish: "",
    sexAmharic: "ወንድ",
    sexEnglish: "Male",
    placeOfBirthAmharic: "ቻግኒ",
    placeOfBirthEnglish: "Chagni",
    dobAmharic: "",
    dobEnglish: "",
    timeOfBirth: "3:30 ረፋድ",
    baptismDateAmharic: "",
    baptismDateEnglish: "",
    penitenceFatherAmharic: "ቀሲስ ቴዎድሮስ ኃይሌ",
    penitenceFatherEnglish: "Kesis Tewodros Haile",
    fatherNameAmharic: "",
    fatherNameEnglish: "",
    fatherAge: "38",
    fatherResidence: "ቻግኒ 02 ቀበሌ",
    motherNameAmharic: "ወ/ሮ አልማዝ አበበ",
    motherNameEnglish: "W/ro Almaz Abebe",
    motherAge: "32",
    motherResidence: "ቻግኒ 02 ቀበሌ",
    registeredBy: "ጸሐፊ ተስፋዬ ገ/ማርያም",
    approvedBy: "መልአከ ገነት ቀሲስ ኃይሌ",
  });

  // Populate data when request changes
  React.useEffect(() => {
    if (!request) return;

    const member = request.member;
    const memberFullName = `${member.firstName} ${member.lastName}`;
    const today = new Date();
    const formattedDateEn = today.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const formattedDateAm = today.toLocaleDateString("am-ET", { year: "numeric", month: "long", day: "numeric" });

    if (request.type === "Marriage") {
      setWeddingData({
        groomAmharic: memberFullName,
        groomEnglish: memberFullName,
        groomNatAmharic: "ኢትዮጵያዊ",
        groomNatEnglish: "Ethiopian",
        brideAmharic: "ወ/ሮ አልማዝ አበበ",
        brideEnglish: "W/ro Almaz Abebe",
        brideNatAmharic: "ኢትዮጵያዊት",
        brideNatEnglish: "Ethiopian",
        priestAmharic: "ቀሲስ ቴዎድሮስ ኃይሌ",
        priestEnglish: "Kesis Tewodros Haile",
        dateAmharic: formattedDateAm,
        dateEnglish: formattedDateEn,
        witness1Amharic: "አቶ በቀለ ደስታ",
        witness1English: "Ato Bekele Desta",
        witness2Amharic: "አቶ ግርማ ወልዴ",
        witness2English: "Ato Girma Wolde",
        witness3Amharic: "ወ/ሮ ስንዱ ታደሰ",
        witness3English: "W/ro Sindu Tadesse",
      });
    } else {
      const dob = member.dateOfBirth ? new Date(member.dateOfBirth) : null;
      const bapDate = member.baptizedDate ? new Date(member.baptizedDate) : null;

      setBaptismData({
        regNo: `BGSM/${request.id.slice(0, 4).toUpperCase()}/16`,
        issueDateAmharic: formattedDateAm,
        issueDateEnglish: formattedDateEn,
        childNameAmharic: memberFullName,
        childNameEnglish: memberFullName,
        sexAmharic: "ወንድ",
        sexEnglish: "Male",
        placeOfBirthAmharic: "ቻግኒ",
        placeOfBirthEnglish: "Chagni",
        dobAmharic: dob ? dob.toLocaleDateString("am-ET", { year: "numeric", month: "long", day: "numeric" }) : formattedDateAm,
        dobEnglish: dob ? dob.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : formattedDateEn,
        timeOfBirth: "3:30 ረፋድ",
        baptismDateAmharic: bapDate ? bapDate.toLocaleDateString("am-ET", { year: "numeric", month: "long", day: "numeric" }) : formattedDateAm,
        baptismDateEnglish: bapDate ? bapDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : formattedDateEn,
        penitenceFatherAmharic: "ቀሲስ ቴዎድሮስ ኃይሌ",
        penitenceFatherEnglish: "Kesis Tewodros Haile",
        fatherNameAmharic: `${member.lastName} ገብረማርያም`,
        fatherNameEnglish: `${member.lastName} Gebremariam`,
        fatherAge: "36",
        fatherResidence: "ቻግኒ 02 ቀበሌ",
        motherNameAmharic: "ወ/ሮ አልማዝ አበበ",
        motherNameEnglish: "W/ro Almaz Abebe",
        motherAge: "30",
        motherResidence: "ቻግኒ 02 ቀበሌ",
        registeredBy: "ጸሐፊ ተስፋዬ ገ/ማርያም",
        approvedBy: "መልአከ ገነት ቀሲስ ኃይሌ",
      });
    }
  }, [request]);

  if (!open || !request) return null;

  const isWedding = request.type === "Marriage";
  // Fullscreen is automatically active when editing, or when toggled manually
  const effectiveFullscreen = isFullscreen || activeTab === "edit";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200",
      effectiveFullscreen ? "p-0" : "p-2 sm:p-4"
    )}>
      {/* Outer Modal Container */}
      <div className={cn(
        "relative flex flex-col bg-surface shadow-2xl transition-all duration-200 overflow-hidden",
        effectiveFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen max-w-none max-h-none rounded-none border-none"
          : "max-h-[96vh] w-full max-w-6xl rounded-2xl border border-border"
      )}>
        
        {/* Header (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background-alt/50 px-5 py-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
              <Printer size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-section-title font-semibold text-text-primary">
                  {isWedding
                    ? (isAmharic ? "የጋብቻ ምስክር ወረቀት" : "Marriage Certificate")
                    : (isAmharic ? "የልደት / የጥምቀት ማስረጃ" : "Birth / Baptism Certificate")}
                </h2>
                {activeTab === "edit" && (
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-small font-medium text-primary">
                    {isAmharic ? "ሙሉ ስክሪን ኤዲተር" : "Fullscreen Editor"}
                  </span>
                )}
              </div>
              <p className="text-label text-text-secondary">
                {isAmharic
                  ? "ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም — ትክክለኛ የቤተክርስቲያን ፎርም"
                  : "Chagni Birhane Genet Kidist Ba'ata Lemariyam — Official Church Form"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab navigation */}
            <div className="flex rounded-lg border border-border bg-surface p-1 text-label">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "preview" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Eye size={13} />
                <span>{isAmharic ? "ዕይታ (Preview)" : "Preview"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "edit" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Edit3 size={13} />
                <span>{isAmharic ? "መረጃ አርም (Edit)" : "Edit Fields"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("calibrate")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "calibrate" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Sliders size={13} />
                <span>{isAmharic ? "አሰላለፍ" : "Fine-Tune"}</span>
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer size={15} />}
              className="bg-gold text-surface-dark hover:bg-gold-hover font-medium shadow-sm ml-2"
            >
              {isAmharic ? "አትም (Print)" : "Print"}
            </Button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              aria-label={effectiveFullscreen ? "Exit full screen" : "Enter full screen"}
              title={effectiveFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
            >
              {effectiveFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mode Toolbar (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface px-5 py-2.5 text-label print:hidden">
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 font-medium text-text-primary">
              <input
                type="checkbox"
                checked={printOnPreprintedStationery}
                onChange={(e) => setPrintOnPreprintedStationery(e.target.checked)}
                className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
              />
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${printOnPreprintedStationery ? "bg-amber-500" : "bg-emerald-500"}`} />
                {printOnPreprintedStationery
                  ? (isAmharic
                      ? "የታተመ ኦሪጅናል ወረቀት ላይ ማተም (ጽሑፍ ብቻ ይታተማል)"
                      : "Print onto pre-printed church stationery (Only field text is printed)")
                  : (isAmharic
                      ? "ሙሉ ፎርሙን ከነማዕቀፉ ማተም (ባዶ ወረቀት ላይ)"
                      : "Full Certificate with Borders & Letterhead (Print onto blank paper)")}
              </span>
            </label>
          </div>

        </div>

        {/* Calibration Sliders Strip (Hidden during print) */}
        {activeTab === "calibrate" && (
          <div className="border-b border-border bg-surface p-4 text-label print:hidden animate-in slide-in-from-top-1 duration-150">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-small font-medium text-text-secondary">X Offset:</span>
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    step="0.5"
                    value={globalOffsetX}
                    onChange={(e) => setGlobalOffsetX(parseFloat(e.target.value))}
                    className="w-28 accent-gold"
                  />
                  <span className="font-mono text-small font-semibold w-12">{globalOffsetX > 0 ? `+${globalOffsetX}` : globalOffsetX}mm</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-small font-medium text-text-secondary">Y Offset:</span>
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    step="0.5"
                    value={globalOffsetY}
                    onChange={(e) => setGlobalOffsetY(parseFloat(e.target.value))}
                    className="w-28 accent-gold"
                  />
                  <span className="font-mono text-small font-semibold w-12">{globalOffsetY > 0 ? `+${globalOffsetY}` : globalOffsetY}mm</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-small font-medium text-text-secondary">Font Scale:</span>
                  <input
                    type="range"
                    min="80"
                    max="125"
                    step="1"
                    value={fontSizeScale}
                    onChange={(e) => setFontSizeScale(parseInt(e.target.value))}
                    className="w-24 accent-gold"
                  />
                  <span className="font-mono text-small font-semibold w-10">{fontSizeScale}%</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGlobalOffsetX(0);
                  setGlobalOffsetY(0);
                  setFontSizeScale(100);
                }}
                className="inline-flex items-center gap-1 text-small text-gold hover:underline"
              >
                <RotateCcw size={12} />
                <span>{isAmharic ? "ወደ ነባሪ መልስ" : "Reset Sliders"}</span>
              </button>
            </div>
          </div>
        )}

        {/* MAIN BODY: SWITCHES BETWEEN FULLSCREEN EDIT WORKSPACE AND PREVIEW WORKSPACE */}
        {activeTab === "edit" ? (
          /* ================================================================ */
          /* FULL-SCREEN DEDICATED FIELD EDITOR WORKSPACE                     */
          /* ================================================================ */
          <div className="flex-1 overflow-y-auto bg-background-alt/40 p-5 sm:p-8 lg:p-10 print:hidden animate-in fade-in duration-150">
            <div className="mx-auto max-w-5xl space-y-6">
              
              {/* Top Action & Guidance Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 via-primary/5 to-surface p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold border border-gold/40">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-section-title font-semibold text-text-primary">
                      {isWedding
                        ? (isAmharic ? "የጋብቻ ምስክር ወረቀት መረጃዎችን ማረሚያ" : "Edit Marriage Certificate Fields")
                        : (isAmharic ? "የልደት/ጥምቀት ምስክር ወረቀት መረጃዎችን ማረሚያ" : "Edit Birth/Baptism Certificate Fields")}
                    </h3>
                    <p className="text-label text-text-secondary">
                      {isAmharic
                        ? "እዚህ የሚያስተካክሉት መረጃ ወዲያውኑ በሰርቲፊኬቱ ፎርም ላይ ይተገበራል። ሲጨርሱ «ዕይታ እይ» የሚለውን ይጫኑ።"
                        : "Changes made here are applied immediately to the certificate form. Click 'View Preview' when done."}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => setActiveTab("preview")}
                  icon={<Eye size={15} />}
                  className="bg-primary text-white shadow-sm"
                >
                  {isAmharic ? "ተጠናቋል — ዕይታ እይ" : "Done & View Preview"}
                </Button>
              </div>

              {isWedding ? (
                /* WEDDING FULL-SCREEN FORM */
                <div className="space-y-6">
                  {/* Row 1: Groom & Bride */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Groom Card */}
                    <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፩</span>
                        <h4 className="text-body font-semibold text-text-primary">
                          የሙሽራው መረጃ (Bridegroom)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ስም (Amharic)</label>
                          <input
                            type="text"
                            value={weddingData.groomAmharic}
                            onChange={(e) => setWeddingData({ ...weddingData, groomAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Full Name (English)</label>
                          <input
                            type="text"
                            value={weddingData.groomEnglish}
                            onChange={(e) => setWeddingData({ ...weddingData, groomEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ዜግነት (Amharic)</label>
                          <input
                            type="text"
                            value={weddingData.groomNatAmharic}
                            onChange={(e) => setWeddingData({ ...weddingData, groomNatAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Nationality (English)</label>
                          <input
                            type="text"
                            value={weddingData.groomNatEnglish}
                            onChange={(e) => setWeddingData({ ...weddingData, groomNatEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bride Card */}
                    <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፪</span>
                        <h4 className="text-body font-semibold text-text-primary">
                          የሙሽሪት መረጃ (Bride)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ስም (Amharic)</label>
                          <input
                            type="text"
                            value={weddingData.brideAmharic}
                            onChange={(e) => setWeddingData({ ...weddingData, brideAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Full Name (English)</label>
                          <input
                            type="text"
                            value={weddingData.brideEnglish}
                            onChange={(e) => setWeddingData({ ...weddingData, brideEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ዜግነት (Amharic)</label>
                          <input
                            type="text"
                            value={weddingData.brideNatAmharic}
                            onChange={(e) => setWeddingData({ ...weddingData, brideNatAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Nationality (English)</label>
                          <input
                            type="text"
                            value={weddingData.brideNatEnglish}
                            onChange={(e) => setWeddingData({ ...weddingData, brideNatEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Priest and Date */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፫</span>
                        <h4 className="text-body font-semibold text-text-primary">
                          ሥርዓቱን የፈጸመው ካህን (Performing Priest)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ካህን (Amharic)</label>
                          <input
                            type="text"
                            value={weddingData.priestAmharic}
                            onChange={(e) => setWeddingData({ ...weddingData, priestAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Priest (English)</label>
                          <input
                            type="text"
                            value={weddingData.priestEnglish}
                            onChange={(e) => setWeddingData({ ...weddingData, priestEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፬</span>
                        <h4 className="text-body font-semibold text-text-primary">
                          ቀን (Date of Marriage)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ቀን (Amharic)</label>
                          <input
                            type="text"
                            value={weddingData.dateAmharic}
                            onChange={(e) => setWeddingData({ ...weddingData, dateAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Date (English)</label>
                          <input
                            type="text"
                            value={weddingData.dateEnglish}
                            onChange={(e) => setWeddingData({ ...weddingData, dateEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: 3 Witnesses */}
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፭</span>
                      <h4 className="text-body font-semibold text-text-primary">
                        የ፫ቱ ምስክሮች ስም (Three Witnesses)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-lg border border-border/70 p-3 bg-background-alt/30 space-y-2">
                        <span className="text-small font-semibold text-gold">ምስክር ፩ (Witness 1)</span>
                        <input
                          type="text"
                          value={weddingData.witness1Amharic}
                          onChange={(e) => setWeddingData({ ...weddingData, witness1Amharic: e.target.value })}
                          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-label"
                          placeholder="Amharic name"
                        />
                        <input
                          type="text"
                          value={weddingData.witness1English}
                          onChange={(e) => setWeddingData({ ...weddingData, witness1English: e.target.value })}
                          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-label"
                          placeholder="English name"
                        />
                      </div>

                      <div className="rounded-lg border border-border/70 p-3 bg-background-alt/30 space-y-2">
                        <span className="text-small font-semibold text-gold">ምስክር ፪ (Witness 2)</span>
                        <input
                          type="text"
                          value={weddingData.witness2Amharic}
                          onChange={(e) => setWeddingData({ ...weddingData, witness2Amharic: e.target.value })}
                          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-label"
                          placeholder="Amharic name"
                        />
                        <input
                          type="text"
                          value={weddingData.witness2English}
                          onChange={(e) => setWeddingData({ ...weddingData, witness2English: e.target.value })}
                          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-label"
                          placeholder="English name"
                        />
                      </div>

                      <div className="rounded-lg border border-border/70 p-3 bg-background-alt/30 space-y-2">
                        <span className="text-small font-semibold text-gold">ምስክር ፫ (Witness 3)</span>
                        <input
                          type="text"
                          value={weddingData.witness3Amharic}
                          onChange={(e) => setWeddingData({ ...weddingData, witness3Amharic: e.target.value })}
                          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-label"
                          placeholder="Amharic name"
                        />
                        <input
                          type="text"
                          value={weddingData.witness3English}
                          onChange={(e) => setWeddingData({ ...weddingData, witness3English: e.target.value })}
                          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-label"
                          placeholder="English name"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* BAPTISM FULL-SCREEN FORM */
                <div className="space-y-6">
                  {/* Registration Header Card */}
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፩</span>
                      <h4 className="text-body font-semibold text-text-primary">
                        የመዝገብ መረጃ (Registration & Issue Date)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-label text-text-secondary block mb-1">የመዝገብ ቁጥር (Reg. No.)</label>
                        <input
                          type="text"
                          value={baptismData.regNo}
                          onChange={(e) => setBaptismData({ ...baptismData, regNo: e.target.value })}
                          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-mono font-bold focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-label text-text-secondary block mb-1">የተሰጠበት ቀን (Amharic)</label>
                        <input
                          type="text"
                          value={baptismData.issueDateAmharic}
                          onChange={(e) => setBaptismData({ ...baptismData, issueDateAmharic: e.target.value })}
                          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-label text-text-secondary block mb-1">Issue Date (English)</label>
                        <input
                          type="text"
                          value={baptismData.issueDateEnglish}
                          onChange={(e) => setBaptismData({ ...baptismData, issueDateEnglish: e.target.value })}
                          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Child and Baptism Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Child Details */}
                    <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፪</span>
                        <h4 className="text-body font-semibold text-text-primary">
                          የሕፃኑ መረጃ (Child Details)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ስም (Amharic)</label>
                          <input
                            type="text"
                            value={baptismData.childNameAmharic}
                            onChange={(e) => setBaptismData({ ...baptismData, childNameAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-bold focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Full Name (English)</label>
                          <input
                            type="text"
                            value={baptismData.childNameEnglish}
                            onChange={(e) => setBaptismData({ ...baptismData, childNameEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-bold focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ፆታ (Amharic)</label>
                          <input
                            type="text"
                            value={baptismData.sexAmharic}
                            onChange={(e) => setBaptismData({ ...baptismData, sexAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Sex (English)</label>
                          <input
                            type="text"
                            value={baptismData.sexEnglish}
                            onChange={(e) => setBaptismData({ ...baptismData, sexEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">የተወለደበት ቦታ (Amharic)</label>
                          <input
                            type="text"
                            value={baptismData.placeOfBirthAmharic}
                            onChange={(e) => setBaptismData({ ...baptismData, placeOfBirthAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Place of Birth (English)</label>
                          <input
                            type="text"
                            value={baptismData.placeOfBirthEnglish}
                            onChange={(e) => setBaptismData({ ...baptismData, placeOfBirthEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">የተወለደበት ቀን (Amharic)</label>
                          <input
                            type="text"
                            value={baptismData.dobAmharic}
                            onChange={(e) => setBaptismData({ ...baptismData, dobAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Date of Birth (English)</label>
                          <input
                            type="text"
                            value={baptismData.dobEnglish}
                            onChange={(e) => setBaptismData({ ...baptismData, dobEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="text-label text-text-secondary block mb-1">የተወለደበት ሰዓት (Time of Birth)</label>
                          <input
                            type="text"
                            value={baptismData.timeOfBirth}
                            onChange={(e) => setBaptismData({ ...baptismData, timeOfBirth: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Baptism & Penitence Father */}
                    <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፫</span>
                        <h4 className="text-body font-semibold text-text-primary">
                          ጥምቀትና የንስሐ አባት (Baptism & Confessor)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ክርስትና የተነሳበት ቀን (Amharic)</label>
                          <input
                            type="text"
                            value={baptismData.baptismDateAmharic}
                            onChange={(e) => setBaptismData({ ...baptismData, baptismDateAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">Date of Baptism (English)</label>
                          <input
                            type="text"
                            value={baptismData.baptismDateEnglish}
                            onChange={(e) => setBaptismData({ ...baptismData, baptismDateEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="text-label text-text-secondary block mb-1">የንስሐ አባት ስም (Penitence Father - Amharic)</label>
                          <input
                            type="text"
                            value={baptismData.penitenceFatherAmharic}
                            onChange={(e) => setBaptismData({ ...baptismData, penitenceFatherAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="text-label text-text-secondary block mb-1">Penitence Father (English)</label>
                          <input
                            type="text"
                            value={baptismData.penitenceFatherEnglish}
                            onChange={(e) => setBaptismData({ ...baptismData, penitenceFatherEnglish: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parents Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Father Card */}
                    <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፬</span>
                        <h4 className="text-body font-semibold text-text-primary">
                          የአባት መረጃ (Father Details)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="sm:col-span-2">
                          <label className="text-label text-text-secondary block mb-1">የአባት ስም (Amharic)</label>
                          <input
                            type="text"
                            value={baptismData.fatherNameAmharic}
                            onChange={(e) => setBaptismData({ ...baptismData, fatherNameAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ዕድሜ (Age)</label>
                          <input
                            type="text"
                            value={baptismData.fatherAge}
                            onChange={(e) => setBaptismData({ ...baptismData, fatherAge: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-label text-text-secondary block mb-1">የመኖሪያ አድራሻ (Residence)</label>
                          <input
                            type="text"
                            value={baptismData.fatherResidence}
                            onChange={(e) => setBaptismData({ ...baptismData, fatherResidence: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mother Card */}
                    <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፭</span>
                        <h4 className="text-body font-semibold text-text-primary">
                          የእናት መረጃ (Mother Details)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="sm:col-span-2">
                          <label className="text-label text-text-secondary block mb-1">የእናት ስም (Amharic)</label>
                          <input
                            type="text"
                            value={baptismData.motherNameAmharic}
                            onChange={(e) => setBaptismData({ ...baptismData, motherNameAmharic: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-label text-text-secondary block mb-1">ዕድሜ (Age)</label>
                          <input
                            type="text"
                            value={baptismData.motherAge}
                            onChange={(e) => setBaptismData({ ...baptismData, motherAge: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-label text-text-secondary block mb-1">የመኖሪያ አድራሻ (Residence)</label>
                          <input
                            type="text"
                            value={baptismData.motherResidence}
                            onChange={(e) => setBaptismData({ ...baptismData, motherResidence: e.target.value })}
                            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signatures Card */}
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-card space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-small">፮</span>
                      <h4 className="text-body font-semibold text-text-primary">
                        የመዝጋቢና የአስተዳዳሪ ስም (Registered By & Approved By)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-label text-text-secondary block mb-1">የመዝጋቢ ስም (Registered by)</label>
                        <input
                          type="text"
                          value={baptismData.registeredBy}
                          onChange={(e) => setBaptismData({ ...baptismData, registeredBy: e.target.value })}
                          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-label text-text-secondary block mb-1">የደብሩ አስተዳዳሪ ስም (Approved by)</label>
                        <input
                          type="text"
                          value={baptismData.approvedBy}
                          onChange={(e) => setBaptismData({ ...baptismData, approvedBy: e.target.value })}
                          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-body font-medium focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Bar */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                >
                  {isAmharic ? "ዝጋ (Close)" : "Close"}
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => setActiveTab("preview")}
                    icon={<Eye size={15} />}
                    className="bg-primary text-white shadow-sm"
                  >
                    {isAmharic ? "ተጠናቋል — ወደ ዕይታ ተመለስ" : "Done & Return to Preview"}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* PREVIEW WORKSPACE WITH CRISP VECTOR CERTIFICATE SHEET             */
          /* ================================================================ */
          <div className="flex-1 overflow-y-auto bg-neutral-900/70 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto flex flex-col items-center">
              
              {/* The Certificate Sheet Canvas */}
              <div
                id="certificate-print-sheet"
                style={{
                  transform: `translateX(${globalOffsetX}mm) translateY(${globalOffsetY}mm)`,
                  fontSize: `${(fontSizeScale / 100) * 13}px`,
                }}
                className={`relative mx-auto w-full transition-all duration-150 overflow-hidden ${
                  isWedding
                    ? "max-w-[960px] aspect-[1.414/1]" // A4 Landscape ratio
                    : "max-w-[720px] aspect-[1/1.414]" // A4 Portrait ratio
                } rounded-lg border border-border shadow-2xl bg-white text-slate-900 print:shadow-none print:border-none print:rounded-none`}
              >
                {isWedding ? (
                  /* ======================================================== */
                  /* MARRIAGE CERTIFICATE — AUTHENTIC FORM FORMAT             */
                  /* ======================================================== */
                  <div
                    className={`h-full w-full p-6 sm:p-8 flex flex-col justify-between font-serif select-text ${
                      printOnPreprintedStationery ? "print:border-transparent" : "border-[6px] border-double border-slate-900 m-2"
                    }`}
                    style={{ boxSizing: "border-box" }}
                  >
                    {/* Outer Ornamental Frame */}
                    <div className={`relative flex flex-col justify-between h-full border border-slate-900/60 p-4 ${
                      printOnPreprintedStationery ? "print:border-transparent" : ""
                    }`}>
                      {/* Top Cross & Scripture Header */}
                      <div className="flex items-start justify-between border-b border-slate-900/40 pb-3">
                        {/* Left Scripture Quote */}
                        <div className={`w-1/4 text-[11px] leading-tight text-slate-800 italic pr-2 ${
                          printOnPreprintedStationery ? "print:invisible" : ""
                        }`}>
                          «እግዚአብሔር አንድ ያደረገውን ሰው አይለየው።»
                          <div className="text-[10px] text-slate-600 not-italic mt-0.5">(ማቴ ፲፱፥፮)</div>
                        </div>

                        {/* Center Title with Crosses */}
                        <div className="flex-1 text-center px-2">
                          <div className="flex items-center justify-center gap-3">
                            <span className={`text-slate-900 font-bold text-lg ${printOnPreprintedStationery ? "print:invisible" : ""}`}>✚</span>
                            <h3 className={`text-[13px] font-bold tracking-wide uppercase text-slate-900 ${
                              printOnPreprintedStationery ? "print:invisible" : ""
                            }`}>
                              በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን
                            </h3>
                            <span className={`text-slate-900 font-bold text-lg ${printOnPreprintedStationery ? "print:invisible" : ""}`}>✚</span>
                          </div>
                          <h2 className={`text-[19px] font-bold text-slate-950 mt-0.5 ${
                            printOnPreprintedStationery ? "print:invisible" : ""
                          }`}>
                            የጋብቻ ምስክር ወረቀት
                          </h2>
                          <div className={`text-[10.5px] font-semibold tracking-wider uppercase text-slate-700 ${
                            printOnPreprintedStationery ? "print:invisible" : ""
                          }`}>
                            Ethiopian Orthodox Tewahedo Church
                          </div>
                          <div className={`text-[12px] font-bold tracking-widest uppercase text-slate-950 ${
                            printOnPreprintedStationery ? "print:invisible" : ""
                          }`}>
                            Marriage Certificate
                          </div>
                        </div>

                        {/* Right Photo Frames */}
                        <div className="w-1/4 flex justify-end gap-1.5 pl-2">
                          <div className={`w-14 h-18 sm:w-16 sm:h-20 border border-slate-900/70 flex flex-col items-center justify-center text-[10px] text-slate-500 bg-slate-50/50 ${
                            printOnPreprintedStationery ? "print:border-transparent print:bg-transparent print:text-transparent" : ""
                          }`}>
                            <span>ፎቶ</span>
                            <span className="text-[9px]">Groom</span>
                          </div>
                          <div className={`w-14 h-18 sm:w-16 sm:h-20 border border-slate-900/70 flex flex-col items-center justify-center text-[10px] text-slate-500 bg-slate-50/50 ${
                            printOnPreprintedStationery ? "print:border-transparent print:bg-transparent print:text-transparent" : ""
                          }`}>
                            <span>ፎቶ</span>
                            <span className="text-[9px]">Bride</span>
                          </div>
                        </div>
                      </div>

                      {/* Dual Column Parallel Form */}
                      <div className="grid grid-cols-2 gap-6 my-2 text-[12px]">
                        {/* Left Column (Amharic) */}
                        <div className="space-y-1.5">
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              የሙሽራው ስም፡
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-bold text-slate-950 px-2 truncate">
                              {weddingData.groomAmharic}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              ዜግነቱ፡
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-medium text-slate-900 px-2 truncate">
                              {weddingData.groomNatAmharic}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              የሙሽሪቷ ስም፡
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-bold text-slate-950 px-2 truncate">
                              {weddingData.brideAmharic}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              ዜግነቷ፡
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-medium text-slate-900 px-2 truncate">
                              {weddingData.brideNatAmharic}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              የጋብቻውን ሥነ ሥርዓት የፈጸመው ካህን፡
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-semibold text-slate-900 px-2 truncate">
                              {weddingData.priestAmharic}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              የጋብቻው ሥነ ሥርዓት የተፈጸመበት ቤ\ክ፡
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-bold text-slate-950 px-2 truncate">
                              ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              ጋብቻው የተፈጸመበት ሀገር፡
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-medium text-slate-900 px-2 truncate">
                              ቻግኒ - ኢትዮጵያ
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              ቀን፡
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-medium text-slate-900 px-2 truncate">
                              {weddingData.dateAmharic}
                            </span>
                          </div>

                          {/* 3 Witnesses (Amharic) */}
                          <div className="pt-1">
                            <div className={`font-medium text-slate-800 text-[11px] mb-0.5 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              የ ፫ ምስክሮች ስም፡
                            </div>
                            <div className="space-y-0.5 text-[11.5px] pl-2">
                              <div className="flex items-baseline">
                                <span className={`w-5 shrink-0 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>ሀ)</span>
                                <span className="flex-1 border-b border-dotted border-slate-900 px-2 truncate">{weddingData.witness1Amharic}</span>
                              </div>
                              <div className="flex items-baseline">
                                <span className={`w-5 shrink-0 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>ለ)</span>
                                <span className="flex-1 border-b border-dotted border-slate-900 px-2 truncate">{weddingData.witness2Amharic}</span>
                              </div>
                              <div className="flex items-baseline">
                                <span className={`w-5 shrink-0 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>ሐ)</span>
                                <span className="flex-1 border-b border-dotted border-slate-900 px-2 truncate">{weddingData.witness3Amharic}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column (English) */}
                        <div className="space-y-1.5">
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Name of bridegroom:
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-bold text-slate-950 px-2 truncate">
                              {weddingData.groomEnglish}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Nationality:
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-medium text-slate-900 px-2 truncate">
                              {weddingData.groomNatEnglish}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Bride:
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-bold text-slate-950 px-2 truncate">
                              {weddingData.brideEnglish}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Performing priest:
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-semibold text-slate-900 px-2 truncate">
                              {weddingData.priestEnglish}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Church:
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-bold text-slate-950 px-2 truncate">
                              Chagni Birhane Genet Kidist Ba&apos;ata Lemariyam
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Country:
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-medium text-slate-900 px-2 truncate">
                              CHAGNI – ETHIOPIA
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Date:
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 font-medium text-slate-900 px-2 truncate">
                              {weddingData.dateEnglish}
                            </span>
                          </div>

                          {/* 3 Witnesses (English) */}
                          <div className="pt-1">
                            <div className={`flex justify-between font-medium text-slate-800 text-[11px] mb-0.5 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span>Name of three witnesses:</span>
                              <span className="text-[10px] text-slate-500">ፊርማ (signature)</span>
                            </div>
                            <div className="space-y-0.5 text-[11.5px] pl-2">
                              <div className="flex items-baseline">
                                <span className={`w-5 shrink-0 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>a)</span>
                                <span className="flex-1 border-b border-dotted border-slate-900 px-2 truncate">{weddingData.witness1English}</span>
                              </div>
                              <div className="flex items-baseline">
                                <span className={`w-5 shrink-0 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>b)</span>
                                <span className="flex-1 border-b border-dotted border-slate-900 px-2 truncate">{weddingData.witness2English}</span>
                              </div>
                              <div className="flex items-baseline">
                                <span className={`w-5 shrink-0 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>c)</span>
                                <span className="flex-1 border-b border-dotted border-slate-900 px-2 truncate">{weddingData.witness3English}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Solemn Church Declaration Paragraph */}
                      <div className="border-t border-b border-slate-900/30 py-2 my-1 text-[11px] leading-relaxed text-slate-800">
                        <p className="mb-1">
                          <span className={printOnPreprintedStationery ? "print:invisible" : ""}>
                            ከዚህ በላይ ስማቸው የተጠቀሰው{" "}
                          </span>
                          <strong className="underline decoration-dotted px-1">{weddingData.groomAmharic}</strong>
                          <span className={printOnPreprintedStationery ? "print:invisible" : ""}> እና </span>
                          <strong className="underline decoration-dotted px-1">{weddingData.brideAmharic}</strong>
                          <span className={printOnPreprintedStationery ? "print:invisible" : ""}>
                            {" "}ጋብቻቸው በሕገ ቤተ ክርስቲያን የተፈጸመ መሆኑን በማረጋገጥና የገቡትን የጋብቻ ቃል ኪዳን እስከ መጨረሻው ጠብቀው ለመኖር የበቁ ይሆኑ ዘንድ በመጸለይ ከኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ይህ የጋብቻ ምስክር ወረቀት ተሰጥቷቸዋል፡፡
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-700 italic">
                          <span className={printOnPreprintedStationery ? "print:invisible" : ""}>
                            This is to certify that the marriage of{" "}
                          </span>
                          <strong className="underline decoration-dotted px-1 not-italic">{weddingData.groomEnglish}</strong>
                          <span className={printOnPreprintedStationery ? "print:invisible" : ""}> and </span>
                          <strong className="underline decoration-dotted px-1 not-italic">{weddingData.brideEnglish}</strong>
                          <span className={printOnPreprintedStationery ? "print:invisible" : ""}>
                            {" "}is performed according to the order of the church and this certificate is given to them by the Ethiopian Orthodox Tewahedo Church, with all prayer and supplication that they may keep the vow and covenant made between them to be joined and live together in holy matrimony to the end.
                          </span>
                        </p>
                      </div>

                      {/* Bottom Signatures */}
                      <div className="grid grid-cols-3 gap-6 pt-3 text-center text-[11.5px]">
                        <div>
                          <div className={`font-medium text-slate-900 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            A) የደብሩ አስተዳዳሪ
                          </div>
                          <div className={`text-[10px] text-slate-600 mb-4 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            Performing priest
                          </div>
                          <div className="border-b border-slate-900/80 mx-4 pb-1 font-semibold">{weddingData.priestAmharic}</div>
                          <div className={`text-[9.5px] text-slate-500 mt-0.5 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>ፊርማ (Signature)</div>
                        </div>

                        <div>
                          <div className={`font-medium text-slate-900 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            B) ሙሽራው
                          </div>
                          <div className={`text-[10px] text-slate-600 mb-4 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            Bridegroom
                          </div>
                          <div className="border-b border-slate-900/80 mx-4 pb-1 font-semibold">{weddingData.groomAmharic}</div>
                          <div className={`text-[9.5px] text-slate-500 mt-0.5 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>ፊርማ (Signature)</div>
                        </div>

                        <div>
                          <div className={`font-medium text-slate-900 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            C) ሙሽሪት
                          </div>
                          <div className={`text-[10px] text-slate-600 mb-4 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            Bride
                          </div>
                          <div className="border-b border-slate-900/80 mx-4 pb-1 font-semibold">{weddingData.brideAmharic}</div>
                          <div className={`text-[9.5px] text-slate-500 mt-0.5 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>ፊርማ (Signature)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ======================================================== */
                  /* BIRTH / BAPTISM CERTIFICATE — AUTHENTIC FORM FORMAT      */
                  /* ======================================================== */
                  <div
                    className={`h-full w-full p-8 sm:p-10 flex flex-col justify-between font-serif select-text ${
                      printOnPreprintedStationery ? "print:border-transparent" : "border-[6px] border-double border-slate-900 m-2"
                    }`}
                    style={{ boxSizing: "border-box" }}
                  >
                    {/* Outer Inner Frame */}
                    <div className={`relative flex flex-col justify-between h-full border border-slate-900/60 p-5 ${
                      printOnPreprintedStationery ? "print:border-transparent" : ""
                    }`}>
                      {/* Header: Parish Name (Left) and Date/Reg.No (Right) */}
                      <div className="flex items-start justify-between border-b border-slate-900/40 pb-4">
                        {/* Left: Canonical Parish Letterhead */}
                        <div className="max-w-[62%]">
                          <div className={`text-[14px] sm:text-[15px] font-bold text-slate-950 leading-snug ${
                            printOnPreprintedStationery ? "print:invisible" : ""
                          }`}>
                            በኢ/ኦ/ተ/ቤ/ክ በጓንጓ ወረዳ ቤተክህነት የቻግኒ ብርሃነ ገነት
                          </div>
                          <div className={`text-[13px] sm:text-[14px] font-bold text-slate-900 leading-snug mt-0.5 ${
                            printOnPreprintedStationery ? "print:invisible" : ""
                          }`}>
                            ቅድስት በዓታ ለማርያም ቤተክርስቲያን ሰበካ ጉባኤ ጽ/ቤት
                          </div>
                        </div>

                        {/* Right: Date and Reg No */}
                        <div className="w-[36%] space-y-1 text-[12px]">
                          <div className="flex items-baseline">
                            <span className={`w-14 shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              ቀን
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 font-semibold text-slate-950 truncate">
                              {baptismData.issueDateAmharic}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`w-14 shrink-0 font-medium text-slate-600 text-[11px] ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Date
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 text-[11.5px] text-slate-800 truncate">
                              {baptismData.issueDateEnglish}
                            </span>
                          </div>
                          <div className="flex items-baseline pt-1">
                            <span className={`w-14 shrink-0 font-medium text-slate-800 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              የመዝገብ ቁ.
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 font-mono font-bold text-slate-950 truncate">
                              {baptismData.regNo}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className={`w-14 shrink-0 font-medium text-slate-600 text-[11px] ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              Reg. No.
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 font-mono text-[11px] text-slate-800 truncate">
                              {baptismData.regNo}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Centered Certificate Title */}
                      <div className="text-center my-3">
                        <h1 className={`text-[23px] sm:text-[25px] font-bold text-slate-950 tracking-wider ${
                          printOnPreprintedStationery ? "print:invisible" : ""
                        }`}>
                          የልደት ማስረጃ
                        </h1>
                        <div className={`text-[13px] font-semibold tracking-widest text-slate-700 italic ${
                          printOnPreprintedStationery ? "print:invisible" : ""
                        }`}>
                          Birth Certificate
                        </div>
                      </div>

                      {/* Form Fields Body */}
                      <div className="space-y-2.5 text-[12.5px] leading-relaxed">
                        {/* Row 1: Child Name & Sex */}
                        <div className="flex items-baseline gap-4">
                          <div className="flex-1 flex items-baseline">
                            <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">የሕፃኑ ስም</span>
                              <span className="block text-[10.5px] text-slate-600">Name of Child</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-bold text-slate-950 text-[13.5px]">
                              {baptismData.childNameAmharic}
                            </span>
                          </div>
                          <div className="w-[30%] flex items-baseline">
                            <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">ፆታ</span>
                              <span className="block text-[10.5px] text-slate-600">Sex</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-semibold text-slate-950 text-center">
                              {baptismData.sexAmharic} ({baptismData.sexEnglish})
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Place of Birth & Nationality */}
                        <div className="flex items-baseline gap-4">
                          <div className="flex-1 flex items-baseline">
                            <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">የተወለደበት ቦታ</span>
                              <span className="block text-[10.5px] text-slate-600">Place of Birth</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-medium text-slate-950">
                              {baptismData.placeOfBirthAmharic} ({baptismData.placeOfBirthEnglish})
                            </span>
                          </div>
                          <div className="w-[32%] flex items-baseline">
                            <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">ዜግነት</span>
                              <span className="block text-[10.5px] text-slate-600">Nationality</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-semibold text-slate-950 text-center">
                              ኢትዮጵያዊ / Ethiopian
                            </span>
                          </div>
                        </div>

                        {/* Row 3: Religion */}
                        <div className="flex items-baseline">
                          <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            <span className="font-semibold text-slate-900">ሃይማኖት</span>
                            <span className="block text-[10.5px] text-slate-600">Religion</span>
                          </span>
                          <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-semibold text-slate-950">
                            የኦርቶዶክስ ተዋሕዶ እምነት ተከታይ (Follower of Orthodox Tewahedo)
                          </span>
                        </div>

                        {/* Row 4: Date of Birth & Time */}
                        <div className="flex items-baseline gap-4">
                          <div className="flex-1 flex items-baseline">
                            <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">የተወለደበት ቀን</span>
                              <span className="block text-[10.5px] text-slate-600">Date of Birth</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-medium text-slate-950">
                              {baptismData.dobAmharic} ({baptismData.dobEnglish})
                            </span>
                          </div>
                          <div className="w-[28%] flex items-baseline">
                            <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">ሰዓት</span>
                              <span className="block text-[10.5px] text-slate-600">Time</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-medium text-slate-950 text-center">
                              {baptismData.timeOfBirth}
                            </span>
                          </div>
                        </div>

                        {/* Row 5: Date of Christianity */}
                        <div className="flex items-baseline">
                          <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            <span className="font-semibold text-slate-900">ክርስትና የተነሳበት ቀን</span>
                            <span className="block text-[10.5px] text-slate-600">Date of Christianity</span>
                          </span>
                          <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-semibold text-slate-950">
                            {baptismData.baptismDateAmharic} ({baptismData.baptismDateEnglish})
                          </span>
                        </div>

                        {/* Row 6: Penitence Father */}
                        <div className="flex items-baseline">
                          <span className={`shrink-0 pr-2 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            <span className="font-semibold text-slate-900">የንስሐ አባት ስም</span>
                            <span className="block text-[10.5px] text-slate-600">Penitence Father</span>
                          </span>
                          <span className="flex-1 border-b border-dotted border-slate-900 px-2 font-semibold text-slate-950">
                            {baptismData.penitenceFatherAmharic}
                          </span>
                        </div>

                        {/* Row 7: Father's 4-field details */}
                        <div className="grid grid-cols-12 gap-2 pt-1 items-baseline">
                          <div className="col-span-4 flex items-baseline">
                            <span className={`shrink-0 pr-1 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">የአባት ስም</span>
                              <span className="block text-[10px] text-slate-600">Father&apos;s Name</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 font-bold text-slate-950 truncate">
                              {baptismData.fatherNameAmharic}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-baseline">
                            <span className={`shrink-0 pr-1 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">ዕድሜ</span>
                              <span className="block text-[10px] text-slate-600">Age</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 text-center font-medium text-slate-950">
                              {baptismData.fatherAge}
                            </span>
                          </div>
                          <div className="col-span-3 flex items-baseline">
                            <span className={`shrink-0 pr-1 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">የመኖሪያ አድራሻ</span>
                              <span className="block text-[10px] text-slate-600">Residence</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 font-medium text-slate-950 truncate">
                              {baptismData.fatherResidence}
                            </span>
                          </div>
                          <div className="col-span-3 flex items-baseline">
                            <span className={`shrink-0 pr-1 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">ዜግነት</span>
                              <span className="block text-[10px] text-slate-600">Nationality</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 text-center font-medium text-slate-950">
                              ኢትዮጵያዊ
                            </span>
                          </div>
                        </div>

                        {/* Row 8: Mother's 4-field details */}
                        <div className="grid grid-cols-12 gap-2 pt-1 items-baseline">
                          <div className="col-span-4 flex items-baseline">
                            <span className={`shrink-0 pr-1 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">የእናት ስም</span>
                              <span className="block text-[10px] text-slate-600">Mother&apos;s Name</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 font-bold text-slate-950 truncate">
                              {baptismData.motherNameAmharic}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-baseline">
                            <span className={`shrink-0 pr-1 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">ዕድሜ</span>
                              <span className="block text-[10px] text-slate-600">Age</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 text-center font-medium text-slate-950">
                              {baptismData.motherAge}
                            </span>
                          </div>
                          <div className="col-span-3 flex items-baseline">
                            <span className={`shrink-0 pr-1 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">የመኖሪያ አድራሻ</span>
                              <span className="block text-[10px] text-slate-600">Residence</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 font-medium text-slate-950 truncate">
                              {baptismData.motherResidence}
                            </span>
                          </div>
                          <div className="col-span-3 flex items-baseline">
                            <span className={`shrink-0 pr-1 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                              <span className="font-semibold text-slate-900">ዜግነት</span>
                              <span className="block text-[10px] text-slate-600">Nationality</span>
                            </span>
                            <span className="flex-1 border-b border-dotted border-slate-900 px-1 text-center font-medium text-slate-950">
                              ኢትዮጵያዊ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Solemn Church Blessing Quote */}
                      <div className="text-right my-2">
                        <p className={`text-[14px] font-bold italic text-slate-950 tracking-wide ${
                          printOnPreprintedStationery ? "print:invisible" : ""
                        }`}>
                          ልዑል እግዚአብሔር ከሁላችን ጋር ይሁን !!!
                        </p>
                      </div>

                      {/* Signatures Bottom Row */}
                      <div className="grid grid-cols-2 gap-10 pt-4 border-t border-slate-900/30 text-[12px]">
                        <div>
                          <div className={`font-semibold text-slate-950 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            የመዝጋቢ ስምና ፊርማ
                          </div>
                          <div className={`text-[10.5px] text-slate-600 mb-6 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            Registered by
                          </div>
                          <div className="border-b border-slate-900 pb-1 font-medium text-slate-900">
                            {baptismData.registeredBy}
                          </div>
                        </div>

                        <div>
                          <div className={`font-semibold text-slate-950 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            የደብሩ አስተዳዳሪ ስምና ፊርማ
                          </div>
                          <div className={`text-[10.5px] text-slate-600 mb-6 ${printOnPreprintedStationery ? "print:invisible" : ""}`}>
                            Approved by
                          </div>
                          <div className="border-b border-slate-900 pb-1 font-medium text-slate-900">
                            {baptismData.approvedBy}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instruction tooltip below preview */}
              <p className="mt-3 text-center text-label text-neutral-400 print:hidden">
                {isAmharic
                  ? "💡 ፎርሙን በባዶ A4 ወረቀት ላይ ወይም በቤተክርስቲያኑ ኦሪጅናል ማተሚያ ወረቀት ላይ ማተም ይችላሉ።"
                  : "💡 Form renders directly in vector quality. Prints onto standard A4 paper or pre-printed church stationery."}
              </p>
            </div>
          </div>
        )}

        {/* Footer with action buttons (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3 print:hidden">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {isAmharic ? "ዝጋ (Close)" : "Close"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === "edit" ? "preview" : "edit")}
              icon={activeTab === "edit" ? <Eye size={14} /> : <Edit3 size={14} />}
            >
              {activeTab === "edit" ? (isAmharic ? "ዕይታ እይ (View Preview)" : "View Preview") : (isAmharic ? "መረጃዎችን አርም (Edit Fields)" : "Edit Fields")}
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              icon={<Printer size={16} />}
              className="bg-gold text-surface-dark hover:bg-gold-hover font-medium shadow-sm"
            >
              {isAmharic ? "አሁን አትም (Print Now)" : "Print Now"}
            </Button>
          </div>
        </div>

      </div>

      {/* Global Print Stylesheet for exact physical printer mapping */}
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
            size: ${isWedding ? "landscape A4" : "portrait A4"};
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
