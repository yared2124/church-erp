"use client";

import * as React from "react";
import {
  X,
  Printer,
  Sliders,
  RotateCcw,
  Upload,
  Info,
  Edit3,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
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

  // Pre-printed paper mode: hides background image during print so only text is printed onto original church stationery
  const [printOnPreprintedPaper, setPrintOnPreprintedPaper] = React.useState(true);
  const [customTemplateUrl, setCustomTemplateUrl] = React.useState<string | null>(null);

  // Calibration offsets (in millimeters for physical printer alignment)
  const [globalOffsetX, setGlobalOffsetX] = React.useState(0);
  const [globalOffsetY, setGlobalOffsetY] = React.useState(0);
  const [fontSizeScale, setFontSizeScale] = React.useState(100);

  // Marriage Certificate Fields (matched 1-to-1 with Chagni Birhane Genet Kidist Ba'ata Lemariyam Marriage Certificate)
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

  // Birth / Baptism Certificate Fields (matched 1-to-1 with Chagni Birhane Genet Ba'ata Lemariyam Birth Certificate)
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
    fatherResidence: "ቻግኒ",
    motherNameAmharic: "ወ/ሮ አልማዝ አበበ",
    motherNameEnglish: "W/ro Almaz Abebe",
    motherAge: "32",
    motherResidence: "ቻግኒ",
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
  const defaultTemplatePath = isWedding
    ? "/certificates/wedding-template.jpg"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      {/* Outer Modal Container */}
      <div className="relative flex max-h-[96vh] w-full max-w-6xl flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
        
        {/* Header (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background-alt/50 px-5 py-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
              <Printer size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-text-primary">
                {isWedding
                  ? (isAmharic ? "የጋብቻ ምስክር ወረቀት ማተሚያ (Marriage Certificate)" : "Marriage Certificate Printer")
                  : (isAmharic ? "የልደት / የጥምቀት ማስረጃ ማተሚያ (Birth Certificate)" : "Birth / Baptism Certificate Printer")}
              </h2>
              <p className="text-[11.5px] text-text-secondary">
                {isAmharic
                  ? "ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም — በቅድመ-የታተመ ወረቀት ላይ ወይም ባዶ ወረቀት ላይ አትም"
                  : "Chagni Birhane Genet Kidist Ba'ata Lemariyam — Print onto pre-printed stationery or blank paper"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab navigation */}
            <div className="flex rounded-lg border border-border bg-surface p-1 text-[12px]">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "preview" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Eye size={13} />
                <span>{isAmharic ? "ዕይታ" : "Preview"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "edit" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Edit3 size={13} />
                <span>{isAmharic ? "መረጃ አርም" : "Edit Fields"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("calibrate")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === "calibrate" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Sliders size={13} />
                <span>{isAmharic ? "አሰላለፍ" : "Calibration"}</span>
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer size={15} />}
              className="bg-gold text-surface-dark hover:bg-gold-light font-semibold shadow-sm ml-2"
            >
              {isAmharic ? "አትም (Print)" : "Print"}
            </Button>

            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar & Print Mode Toggle Strip (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface px-5 py-2 text-[12px] print:hidden">
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 font-medium text-text-primary">
              <input
                type="checkbox"
                checked={printOnPreprintedPaper}
                onChange={(e) => setPrintOnPreprintedPaper(e.target.checked)}
                className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
              />
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                {isAmharic
                  ? "የታተመ የቤተክርስቲያን ወረቀት ላይ ማተም (ጽሑፉ ብቻ በክፍት ቦታዎች ላይ ያርፋል)"
                  : "Print onto pre-printed church stationery (Only overlay text will be printed)"}
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-secondary">
              {isWedding ? "📐 A4 Landscape (አግድም)" : "📐 A4 Portrait (ቁመት)"}
            </span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-background-alt hover:text-text-primary">
              <Upload size={12} />
              <span>{isAmharic ? "ምስል ቀይር/ጫን" : "Upload Image"}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {customTemplateUrl && (
              <button
                onClick={() => setCustomTemplateUrl(null)}
                className="text-[11px] text-danger hover:underline"
              >
                {isAmharic ? "ወደ ነባሪ መልስ" : "Reset image"}
              </button>
            )}
          </div>
        </div>

        {/* Secondary Sub-panel: Tab Content (Hidden during print) */}
        {activeTab === "edit" && (
          <div className="border-b border-border bg-surface p-4 max-h-72 overflow-y-auto print:hidden animate-in slide-in-from-top-1 duration-150">
            {isWedding ? (
              /* Wedding Edit Fields */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Groom */}
                  <div className="rounded-xl border border-border/80 bg-background-alt/30 p-3 space-y-2">
                    <h4 className="text-[12px] font-semibold text-gold uppercase tracking-wider">
                      ፩. የሙሽራው መረጃ (Groom Information)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-text-secondary block">ስም (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.groomAmharic}
                          onChange={(e) => setWeddingData({ ...weddingData, groomAmharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Name (English)</label>
                        <input
                          type="text"
                          value={weddingData.groomEnglish}
                          onChange={(e) => setWeddingData({ ...weddingData, groomEnglish: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">ዜግነት (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.groomNatAmharic}
                          onChange={(e) => setWeddingData({ ...weddingData, groomNatAmharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Nationality (English)</label>
                        <input
                          type="text"
                          value={weddingData.groomNatEnglish}
                          onChange={(e) => setWeddingData({ ...weddingData, groomNatEnglish: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bride */}
                  <div className="rounded-xl border border-border/80 bg-background-alt/30 p-3 space-y-2">
                    <h4 className="text-[12px] font-semibold text-gold uppercase tracking-wider">
                      ፪. የሙሽሪት መረጃ (Bride Information)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-text-secondary block">ስም (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.brideAmharic}
                          onChange={(e) => setWeddingData({ ...weddingData, brideAmharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Name (English)</label>
                        <input
                          type="text"
                          value={weddingData.brideEnglish}
                          onChange={(e) => setWeddingData({ ...weddingData, brideEnglish: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">ዜግነት (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.brideNatAmharic}
                          onChange={(e) => setWeddingData({ ...weddingData, brideNatAmharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Nationality (English)</label>
                        <input
                          type="text"
                          value={weddingData.brideNatEnglish}
                          onChange={(e) => setWeddingData({ ...weddingData, brideNatEnglish: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Priest & Date */}
                  <div className="rounded-xl border border-border/80 bg-background-alt/30 p-3 space-y-2">
                    <h4 className="text-[12px] font-semibold text-gold uppercase tracking-wider">
                      ፫. ካህን እና ቀን (Priest & Date)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-text-secondary block">ካህን (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.priestAmharic}
                          onChange={(e) => setWeddingData({ ...weddingData, priestAmharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Priest (English)</label>
                        <input
                          type="text"
                          value={weddingData.priestEnglish}
                          onChange={(e) => setWeddingData({ ...weddingData, priestEnglish: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">ቀን (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.dateAmharic}
                          onChange={(e) => setWeddingData({ ...weddingData, dateAmharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Date (English)</label>
                        <input
                          type="text"
                          value={weddingData.dateEnglish}
                          onChange={(e) => setWeddingData({ ...weddingData, dateEnglish: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3 Witnesses */}
                  <div className="rounded-xl border border-border/80 bg-background-alt/30 p-3 space-y-2">
                    <h4 className="text-[12px] font-semibold text-gold uppercase tracking-wider">
                      ፬. የ ፫ ምስክሮች ስም (Three Witnesses)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-text-secondary block">ምስክር ሀ (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.witness1Amharic}
                          onChange={(e) => setWeddingData({ ...weddingData, witness1Amharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Witness a (English)</label>
                        <input
                          type="text"
                          value={weddingData.witness1English}
                          onChange={(e) => setWeddingData({ ...weddingData, witness1English: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">ምስክር ለ (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.witness2Amharic}
                          onChange={(e) => setWeddingData({ ...weddingData, witness2Amharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Witness b (English)</label>
                        <input
                          type="text"
                          value={weddingData.witness2English}
                          onChange={(e) => setWeddingData({ ...weddingData, witness2English: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Birth / Baptism Edit Fields */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-text-secondary block">የመዝገብ ቁ. / Reg.No</label>
                    <input
                      type="text"
                      value={baptismData.regNo}
                      onChange={(e) => setBaptismData({ ...baptismData, regNo: e.target.value })}
                      className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block">ቀን (Amharic)</label>
                    <input
                      type="text"
                      value={baptismData.issueDateAmharic}
                      onChange={(e) => setBaptismData({ ...baptismData, issueDateAmharic: e.target.value })}
                      className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block">Date (English)</label>
                    <input
                      type="text"
                      value={baptismData.issueDateEnglish}
                      onChange={(e) => setBaptismData({ ...baptismData, issueDateEnglish: e.target.value })}
                      className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-background-alt/30 p-3 space-y-2">
                  <h4 className="text-[12px] font-semibold text-gold uppercase tracking-wider">
                    ፩. የሕፃኑ መረጃ (Child Details)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-text-secondary block">የሕፃኑ ስም (Amharic)</label>
                      <input
                        type="text"
                        value={baptismData.childNameAmharic}
                        onChange={(e) => setBaptismData({ ...baptismData, childNameAmharic: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">Name of Child (English)</label>
                      <input
                        type="text"
                        value={baptismData.childNameEnglish}
                        onChange={(e) => setBaptismData({ ...baptismData, childNameEnglish: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">ጾታ / Sex</label>
                      <select
                        value={baptismData.sexAmharic}
                        onChange={(e) =>
                          setBaptismData({
                            ...baptismData,
                            sexAmharic: e.target.value,
                            sexEnglish: e.target.value === "ወንድ" ? "Male" : "Female",
                          })
                        }
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      >
                        <option value="ወንድ">ወንድ (Male)</option>
                        <option value="ሴት">ሴት (Female)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የተወለደበት ሰዓት (Time)</label>
                      <input
                        type="text"
                        value={baptismData.timeOfBirth}
                        onChange={(e) => setBaptismData({ ...baptismData, timeOfBirth: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የተወለደበት ቦታ (Amharic)</label>
                      <input
                        type="text"
                        value={baptismData.placeOfBirthAmharic}
                        onChange={(e) => setBaptismData({ ...baptismData, placeOfBirthAmharic: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">Place of Birth (English)</label>
                      <input
                        type="text"
                        value={baptismData.placeOfBirthEnglish}
                        onChange={(e) => setBaptismData({ ...baptismData, placeOfBirthEnglish: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የተወለደበት ቀን (Amharic)</label>
                      <input
                        type="text"
                        value={baptismData.dobAmharic}
                        onChange={(e) => setBaptismData({ ...baptismData, dobAmharic: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">Date of Birth (English)</label>
                      <input
                        type="text"
                        value={baptismData.dobEnglish}
                        onChange={(e) => setBaptismData({ ...baptismData, dobEnglish: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-background-alt/30 p-3 space-y-2">
                  <h4 className="text-[12px] font-semibold text-gold uppercase tracking-wider">
                    ፪. ክርስትና እና የንስሐ አባት (Baptism & Priest)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-text-secondary block">ክርስትና ቀን (Amharic)</label>
                      <input
                        type="text"
                        value={baptismData.baptismDateAmharic}
                        onChange={(e) => setBaptismData({ ...baptismData, baptismDateAmharic: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">Baptism Date (English)</label>
                      <input
                        type="text"
                        value={baptismData.baptismDateEnglish}
                        onChange={(e) => setBaptismData({ ...baptismData, baptismDateEnglish: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የንስሐ አባት ስም (Amharic)</label>
                      <input
                        type="text"
                        value={baptismData.penitenceFatherAmharic}
                        onChange={(e) => setBaptismData({ ...baptismData, penitenceFatherAmharic: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">Penitence Father (English)</label>
                      <input
                        type="text"
                        value={baptismData.penitenceFatherEnglish}
                        onChange={(e) => setBaptismData({ ...baptismData, penitenceFatherEnglish: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-background-alt/30 p-3 space-y-2">
                  <h4 className="text-[12px] font-semibold text-gold uppercase tracking-wider">
                    ፫. የወላጆች መረጃ (Parents Details)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-text-secondary block">የአባት ስም (Amharic)</label>
                      <input
                        type="text"
                        value={baptismData.fatherNameAmharic}
                        onChange={(e) => setBaptismData({ ...baptismData, fatherNameAmharic: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">Father's Name (English)</label>
                      <input
                        type="text"
                        value={baptismData.fatherNameEnglish}
                        onChange={(e) => setBaptismData({ ...baptismData, fatherNameEnglish: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የአባት ዕድሜ / Age</label>
                      <input
                        type="text"
                        value={baptismData.fatherAge}
                        onChange={(e) => setBaptismData({ ...baptismData, fatherAge: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የአባት አድራሻ / Residence</label>
                      <input
                        type="text"
                        value={baptismData.fatherResidence}
                        onChange={(e) => setBaptismData({ ...baptismData, fatherResidence: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የእናት ስም (Amharic)</label>
                      <input
                        type="text"
                        value={baptismData.motherNameAmharic}
                        onChange={(e) => setBaptismData({ ...baptismData, motherNameAmharic: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">Mother's Name (English)</label>
                      <input
                        type="text"
                        value={baptismData.motherNameEnglish}
                        onChange={(e) => setBaptismData({ ...baptismData, motherNameEnglish: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የእናት ዕድሜ / Age</label>
                      <input
                        type="text"
                        value={baptismData.motherAge}
                        onChange={(e) => setBaptismData({ ...baptismData, motherAge: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-secondary block">የእናት አድራሻ / Residence</label>
                      <input
                        type="text"
                        value={baptismData.motherResidence}
                        onChange={(e) => setBaptismData({ ...baptismData, motherResidence: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Secondary Sub-panel: Calibration Controls (Hidden during print) */}
        {activeTab === "calibrate" && (
          <div className="border-b border-border bg-background-alt/40 p-4 text-[12px] print:hidden animate-in slide-in-from-top-1 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary">
                  {isAmharic ? "አግድም ማስተካከያ (X Offset)" : "Horizontal Offset (X)"}: {globalOffsetX}mm
                </label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={globalOffsetX}
                  onChange={(e) => setGlobalOffsetX(Number(e.target.value))}
                  className="mt-1 w-full accent-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-secondary">
                  {isAmharic ? "ቁመት ማስተካከያ (Y Offset)" : "Vertical Offset (Y)"}: {globalOffsetY}mm
                </label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={globalOffsetY}
                  onChange={(e) => setGlobalOffsetY(Number(e.target.value))}
                  className="mt-1 w-full accent-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-secondary">
                  {isAmharic ? "የፊደል መጠን (Font Scale)" : "Font Scale"}: {fontSizeScale}%
                </label>
                <input
                  type="range"
                  min="80"
                  max="135"
                  value={fontSizeScale}
                  onChange={(e) => setFontSizeScale(Number(e.target.value))}
                  className="mt-1 w-full accent-gold"
                />
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGlobalOffsetX(0);
                    setGlobalOffsetY(0);
                    setFontSizeScale(100);
                  }}
                  icon={<RotateCcw size={13} />}
                >
                  {isAmharic ? "ወደ ነባሪ መልስ" : "Reset Sliders"}
                </Button>
              </div>
            </div>

            <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-text-muted">
              <Info size={13} className="shrink-0 text-gold mt-0.5" />
              <span>
                {isAmharic
                  ? "የፕሪንተርዎ ህዳግ (Margin) ጥቂት ሚሊሜትር ዝንፍ ቢል፣ ከላይ ባሉት ማስመሪያዎች የጽሑፉን አቀማመጥ ከወረቀትዎ ክፍት ቦታዎች ጋር በትክክል መግጠም ይችላሉ።"
                  : "If your physical printer has margin deviations, use the X and Y sliders to nudge text onto the exact dotted lines."}
              </span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Workspace for Preview */}
        <div className="flex-1 overflow-y-auto bg-neutral-900/60 p-4 sm:p-6">
          <div className="mx-auto flex flex-col items-center">
            
            {/* The Certificate Sheet Canvas */}
            <div
              id="certificate-print-sheet"
              style={{
                transform: `translateX(${globalOffsetX}mm) translateY(${globalOffsetY}mm)`,
                fontSize: `${(fontSizeScale / 100) * 12.5}px`,
              }}
              className={`relative mx-auto w-full transition-all duration-150 overflow-hidden ${
                isWedding
                  ? "max-w-[960px] aspect-[1.316/1]"
                  : "max-w-[690px] aspect-[738/945]"
              } rounded-lg border border-border shadow-2xl ${
                printOnPreprintedPaper
                  ? "print:bg-transparent print:border-none print:shadow-none"
                  : "bg-white text-black"
              }`}
            >
              {/* Background Template Image */}
              {/* Visible on screen for visual positioning & alignment preview */}
              {/* Hidden during print if user is feeding pre-printed church stationery */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity ${
                  printOnPreprintedPaper ? "print:hidden opacity-95" : "opacity-100"
                }`}
                style={{
                  backgroundImage: `url(${activeTemplateSrc})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              />

              {/* OVERLAY FIELD SYSTEM */}
              {isWedding ? (
                /* ======================================================== */
                /* MARRIAGE CERTIFICATE OVERLAY (CHAGNI BA'ATA LEMARIYAM)    */
                /* ======================================================== */
                <div className="absolute inset-0 pointer-events-none font-serif text-slate-900 print:text-black">
                  
                  {/* LEFT COLUMN (AMHARIC FIELDS) */}
                  {/* 1. የሙሽራው ስም */}
                  <div
                    style={{ left: "20.5%", top: "30.4%", width: "27%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[13.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.groomAmharic}
                  </div>

                  {/* 2. ዜግነቱ */}
                  <div
                    style={{ left: "15%", top: "34.2%", width: "32%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[13px] text-blue-950 print:text-black"
                  >
                    {weddingData.groomNatAmharic}
                  </div>

                  {/* 3. የሙሽሪት ስም */}
                  <div
                    style={{ left: "20.5%", top: "38.0%", width: "27%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[13.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.brideAmharic}
                  </div>

                  {/* 4. ዜግነቷ */}
                  <div
                    style={{ left: "15%", top: "41.6%", width: "32%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[13px] text-blue-950 print:text-black"
                  >
                    {weddingData.brideNatAmharic}
                  </div>

                  {/* 5. የጋብቻውን ሥነ ሥርዓት የፈጸመው ካህን */}
                  <div
                    style={{ left: "37%", top: "45.2%", width: "11%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.priestAmharic}
                  </div>

                  {/* 8. ቀን */}
                  <div
                    style={{ left: "11%", top: "62.8%", width: "35%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.dateAmharic}
                  </div>

                  {/* 9. የ ፫ ምስክሮች ስም */}
                  <div
                    style={{ left: "24%", top: "66.5%", width: "23%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness1Amharic}
                  </div>
                  <div
                    style={{ left: "22%", top: "70.5%", width: "25%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness2Amharic}
                  </div>
                  <div
                    style={{ left: "22%", top: "74.5%", width: "25%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness3Amharic}
                  </div>

                  {/* RIGHT COLUMN (ENGLISH FIELDS) */}
                  <div
                    style={{ left: "64.5%", top: "29.2%", width: "25%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[13px] text-blue-950 print:text-black"
                  >
                    {weddingData.groomEnglish}
                  </div>
                  <div
                    style={{ left: "59%", top: "33.0%", width: "30%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.groomNatEnglish}
                  </div>
                  <div
                    style={{ left: "55.5%", top: "36.8%", width: "33%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[13px] text-blue-950 print:text-black"
                  >
                    {weddingData.brideEnglish}
                  </div>
                  <div
                    style={{ left: "63.5%", top: "40.6%", width: "25%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.priestEnglish}
                  </div>
                  <div
                    style={{ left: "55%", top: "54.2%", width: "33%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.dateEnglish}
                  </div>
                  <div
                    style={{ left: "57%", top: "62.8%", width: "31%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness1English}
                  </div>
                  <div
                    style={{ left: "57%", top: "66.8%", width: "31%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness2English}
                  </div>
                  <div
                    style={{ left: "57%", top: "70.8%", width: "31%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness3English}
                  </div>

                  {/* MIDDLE PARAGRAPH (AMHARIC STATEMENT) */}
                  <div
                    style={{ left: "27.5%", top: "79.5%", width: "22%" }}
                    className="absolute -translate-y-1/2 text-center overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.groomAmharic}
                  </div>
                  <div
                    style={{ left: "52%", top: "79.5%", width: "23%" }}
                    className="absolute -translate-y-1/2 text-center overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.brideAmharic}
                  </div>

                  {/* MIDDLE PARAGRAPH (ENGLISH STATEMENT) */}
                  <div
                    style={{ left: "37.5%", top: "90.2%", width: "19%" }}
                    className="absolute -translate-y-1/2 text-center overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[11.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.groomEnglish}
                  </div>
                  <div
                    style={{ left: "60%", top: "90.2%", width: "25%" }}
                    className="absolute -translate-y-1/2 text-center overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[11.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.brideEnglish}
                  </div>

                  {/* BOTTOM SIGNATURES */}
                  <div
                    style={{ left: "13%", top: "96.5%", width: "18%" }}
                    className="absolute -translate-y-1/2 text-center text-[10.5px] font-semibold text-blue-950/80 print:text-black"
                  >
                    {weddingData.priestAmharic}
                  </div>
                  <div
                    style={{ left: "43%", top: "96.5%", width: "18%" }}
                    className="absolute -translate-y-1/2 text-center text-[10.5px] font-semibold text-blue-950/80 print:text-black"
                  >
                    {weddingData.groomAmharic}
                  </div>
                  <div
                    style={{ left: "73%", top: "96.5%", width: "18%" }}
                    className="absolute -translate-y-1/2 text-center text-[10.5px] font-semibold text-blue-950/80 print:text-black"
                  >
                    {weddingData.brideAmharic}
                  </div>
                </div>
              ) : (
                /* ======================================================== */
                /* BIRTH / BAPTISM CERTIFICATE OVERLAY (CHAGNI FORM)        */
                /* ======================================================== */
                <div className="absolute inset-0 pointer-events-none font-serif text-slate-900 print:text-black">
                  
                  {/* TOP RIGHT: ቀን እና የመዝገብ ቁጥር */}
                  {/* ቀን (Amharic) */}
                  <div
                    style={{ left: "71%", top: "15.2%", width: "17%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.issueDateAmharic}
                  </div>
                  {/* Date (English) */}
                  <div
                    style={{ left: "71%", top: "18.3%", width: "17%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.issueDateEnglish}
                  </div>
                  {/* የመዝገብ ቁ. (Amharic) */}
                  <div
                    style={{ left: "75%", top: "22.3%", width: "13%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-mono font-bold text-[12px] text-blue-950 print:text-black"
                  >
                    {baptismData.regNo}
                  </div>
                  {/* Reg.No. (English) */}
                  <div
                    style={{ left: "71%", top: "25.3%", width: "17%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-mono font-bold text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.regNo}
                  </div>

                  {/* 1. የሕፃኑ ስም & ጾታ */}
                  {/* የሕፃኑ ስም (Amharic) */}
                  <div
                    style={{ left: "20%", top: "35.5%", width: "35%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[13px] text-blue-950 print:text-black"
                  >
                    {baptismData.childNameAmharic}
                  </div>
                  {/* ጾታ (Amharic) */}
                  <div
                    style={{ left: "62%", top: "35.5%", width: "16%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {baptismData.sexAmharic}
                  </div>
                  {/* Name of Child (English) */}
                  <div
                    style={{ left: "24%", top: "38.7%", width: "31%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[12.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.childNameEnglish}
                  </div>
                  {/* Sex (English) */}
                  <div
                    style={{ left: "62%", top: "38.7%", width: "16%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.sexEnglish}
                  </div>

                  {/* 2. የተወለደበት ቦታ */}
                  {/* የተወለደበት ቦታ (Amharic) */}
                  <div
                    style={{ left: "23%", top: "41.9%", width: "32%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {baptismData.placeOfBirthAmharic}
                  </div>
                  {/* Place of Birth (English) */}
                  <div
                    style={{ left: "24%", top: "45.0%", width: "31%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.placeOfBirthEnglish}
                  </div>

                  {/* 4. የተወለደበት ቀን & ሰዓት */}
                  {/* የተወለደበት ቀን (Amharic) */}
                  <div
                    style={{ left: "23%", top: "53.2%", width: "26%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.dobAmharic}
                  </div>
                  {/* ሰዓት (Amharic) */}
                  <div
                    style={{ left: "55%", top: "53.2%", width: "18%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.timeOfBirth}
                  </div>
                  {/* Date of Birth (English) */}
                  <div
                    style={{ left: "23%", top: "56.4%", width: "26%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.dobEnglish}
                  </div>
                  {/* Time (English) */}
                  <div
                    style={{ left: "55%", top: "56.4%", width: "18%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.timeOfBirth}
                  </div>

                  {/* 5. ክርስትና የተነሳበት ቀን */}
                  {/* ክርስትና የተነሳበት ቀን (Amharic) */}
                  <div
                    style={{ left: "28%", top: "59.3%", width: "32%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] text-blue-950 print:text-black"
                  >
                    {baptismData.baptismDateAmharic}
                  </div>
                  {/* Date of Christianity (English) */}
                  <div
                    style={{ left: "28%", top: "62.4%", width: "32%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.baptismDateEnglish}
                  </div>

                  {/* 6. የንስሐ አባት ስም */}
                  {/* የንስሐ አባት ስም (Amharic) */}
                  <div
                    style={{ left: "25%", top: "65.5%", width: "35%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] text-blue-950 print:text-black"
                  >
                    {baptismData.penitenceFatherAmharic}
                  </div>
                  {/* Penitence Father (English) */}
                  <div
                    style={{ left: "25%", top: "68.6%", width: "35%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.penitenceFatherEnglish}
                  </div>

                  {/* 7. የአባት ስም፣ ዕድሜ፣ አድራሻ */}
                  {/* የአባት ስም (Amharic) */}
                  <div
                    style={{ left: "20%", top: "71.4%", width: "22%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.fatherNameAmharic}
                  </div>
                  {/* ዕድሜ (Amharic) */}
                  <div
                    style={{ left: "46%", top: "71.4%", width: "7%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.fatherAge}
                  </div>
                  {/* የመኖሪያ አድራሻ (Amharic) */}
                  <div
                    style={{ left: "62%", top: "71.4%", width: "17%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.fatherResidence}
                  </div>
                  {/* Father's Name (English) */}
                  <div
                    style={{ left: "23%", top: "74.4%", width: "19%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.fatherNameEnglish}
                  </div>
                  {/* Age (English) */}
                  <div
                    style={{ left: "46%", top: "74.4%", width: "7%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.fatherAge}
                  </div>
                  {/* Residence (English) */}
                  <div
                    style={{ left: "62%", top: "74.4%", width: "17%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[10.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.fatherResidence}
                  </div>

                  {/* 8. የእናት ስም፣ ዕድሜ፣ አድራሻ */}
                  {/* የእናት ስም (Amharic) */}
                  <div
                    style={{ left: "20%", top: "77.3%", width: "22%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.motherNameAmharic}
                  </div>
                  {/* ዕድሜ (Amharic) */}
                  <div
                    style={{ left: "46%", top: "77.3%", width: "7%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.motherAge}
                  </div>
                  {/* የመኖሪያ አድራሻ (Amharic) */}
                  <div
                    style={{ left: "62%", top: "77.3%", width: "17%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.motherResidence}
                  </div>
                  {/* Mother's Name (English) */}
                  <div
                    style={{ left: "24%", top: "80.2%", width: "18%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.motherNameEnglish}
                  </div>
                  {/* Age (English) */}
                  <div
                    style={{ left: "46%", top: "80.2%", width: "7%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.motherAge}
                  </div>
                  {/* Residence (English) */}
                  <div
                    style={{ left: "62%", top: "80.2%", width: "17%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[10.5px] text-blue-950 print:text-black"
                  >
                    {baptismData.motherResidence}
                  </div>

                  {/* SIGNATURES AT BOTTOM */}
                  {/* የመዝጋቢ ስምና ፊርማ (Registered by) */}
                  <div
                    style={{ left: "16%", top: "92.2%", width: "28%" }}
                    className="absolute -translate-y-1/2 text-center overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.registeredBy}
                  </div>
                  {/* የደብሩ አስተዳዳሪ ስምና ፊርማ (Approved by) */}
                  <div
                    style={{ left: "65%", top: "92.2%", width: "26%" }}
                    className="absolute -translate-y-1/2 text-center overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[11px] text-blue-950 print:text-black"
                  >
                    {baptismData.approvedBy}
                  </div>
                </div>
              )}
            </div>

            {/* Instruction tooltip below preview */}
            <p className="mt-3 text-center text-[11.5px] text-neutral-400 print:hidden">
              {isAmharic
                ? "💡 ፕሪንተር ላይ ስታስገቡ ኦሪጅናል ወረቀቱን ብቻ ያስገቡ፤ ጽሑፎቹ በየመስመሮቹ ላይ በትክክል ያርፋሉ።"
                : "💡 When printing onto physical paper, insert your church stationery into the tray. Only text will print onto the dotted lines."}
            </p>
          </div>
        </div>

        {/* Footer with action buttons (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3 print:hidden">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {isAmharic ? "ዝጋ (Close)" : "Close"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === "edit" ? "preview" : "edit")}
              icon={<Edit3 size={14} />}
            >
              {activeTab === "edit" ? (isAmharic ? "ዕይታ እይ" : "View Preview") : (isAmharic ? "መረጃዎችን አርም" : "Edit Fields")}
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              icon={<Printer size={16} />}
              className="bg-gold text-surface-dark hover:bg-gold-light font-semibold shadow-sm"
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
