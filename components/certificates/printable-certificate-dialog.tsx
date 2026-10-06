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
  Check,
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
  certificateNo: string;
  fullName: string;
  christianName: string;
  dateOfBirth: string;
  sacramentDate: string;
  issueDate: string;
  officiatingPriest: string;
  godparent: string;
  churchName: string;
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

  // Marriage Certificate Fields (matched 1-to-1 with Chagni Birhane Genet Kidist Be'ata Lemariyam Marriage Certificate)
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

  // Baptism Certificate Fields
  const [baptismData, setBaptismData] = React.useState<BaptismFieldData>({
    certificateNo: "",
    fullName: "",
    christianName: "",
    dateOfBirth: "",
    sacramentDate: "",
    issueDate: "",
    officiatingPriest: "ቀሲስ ቴዎድሮስ ኃይሌ",
    godparent: "ወ/ሮ የሺእመቤት ተሰማ",
    churchName: "ቻግኒ ብርሃነ ገነት ቅድስት ቤዓታ ለማርያም",
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
      setBaptismData({
        certificateNo: `BGSM-BAP-${request.id.slice(0, 6).toUpperCase()}`,
        fullName: memberFullName,
        christianName: (member as unknown as { christianName?: string }).christianName || "ወልደ ማርያም",
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "",
        sacramentDate: member.baptizedDate ? new Date(member.baptizedDate).toLocaleDateString() : formattedDateEn,
        issueDate: formattedDateAm,
        officiatingPriest: "ቀሲስ ቴዎድሮስ ኃይሌ",
        godparent: "ወ/ሮ የሺእመቤት ተሰማ",
        churchName: "ቻግኒ ብርሃነ ገነት ቅድስት ቤዓታ ለማርያም",
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
                  : (isAmharic ? "የጥምቀት ምስክር ወረቀት ማተሚያ (Baptism Certificate)" : "Baptism Certificate Printer")}
              </h2>
              <p className="text-[11.5px] text-text-secondary">
                {isAmharic
                  ? "ቻግኒ ብርሃነ ገነት ቅድስት ቤዓታ ለማርያም — በቅድመ-የታተመ ወረቀት ላይ ወይም ባዶ ወረቀት ላይ አትም"
                  : "Chagni Birhane Genet Kidist Be'ata Lemariyam — Print onto pre-printed stationery or blank paper"}
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
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-background-alt hover:text-text-primary">
              <Upload size={12} />
              <span>{isAmharic ? "ምስል ቀይር/ጫን" : "Upload Template Image"}</span>
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
          <div className="border-b border-border bg-surface p-4 max-h-64 overflow-y-auto print:hidden animate-in slide-in-from-top-1 duration-150">
            {isWedding ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Groom */}
                  <div className="rounded-xl border border-border/80 bg-background-alt/30 p-3 space-y-2">
                    <h4 className="text-[12px] font-semibold text-gold uppercase tracking-wider">
                      {isAmharic ? "፩. የሙሽራው መረጃ (Groom Information)" : "1. Groom Information"}
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
                      {isAmharic ? "፪. የሙሽሪት መረጃ (Bride Information)" : "2. Bride Information"}
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
                      {isAmharic ? "፫. ካህን እና ቀን (Priest & Date)" : "3. Priest & Date"}
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
                      {isAmharic ? "፬. የ ፫ ምስክሮች ስም (Three Witnesses)" : "4. Three Witnesses"}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-text-secondary block">ምስክር ሀ / a (Amharic)</label>
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
                        <label className="text-[11px] text-text-secondary block">ምስክር ለ / b (Amharic)</label>
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
                      <div>
                        <label className="text-[11px] text-text-secondary block">ምስክር ሐ / c (Amharic)</label>
                        <input
                          type="text"
                          value={weddingData.witness3Amharic}
                          onChange={(e) => setWeddingData({ ...weddingData, witness3Amharic: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block">Witness c (English)</label>
                        <input
                          type="text"
                          value={weddingData.witness3English}
                          onChange={(e) => setWeddingData({ ...weddingData, witness3English: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary block">የምዕመኑ ሙሉ ስም</label>
                  <input
                    type="text"
                    value={baptismData.fullName}
                    onChange={(e) => setBaptismData({ ...baptismData, fullName: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block">የክርስትና ስም</label>
                  <input
                    type="text"
                    value={baptismData.christianName}
                    onChange={(e) => setBaptismData({ ...baptismData, christianName: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block">የትውልድ ቀን</label>
                  <input
                    type="text"
                    value={baptismData.dateOfBirth}
                    onChange={(e) => setBaptismData({ ...baptismData, dateOfBirth: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block">የተጠመቁበት ቀን</label>
                  <input
                    type="text"
                    value={baptismData.sacramentDate}
                    onChange={(e) => setBaptismData({ ...baptismData, sacramentDate: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block">ያጠመቁት አባት ካህን</label>
                  <input
                    type="text"
                    value={baptismData.officiatingPriest}
                    onChange={(e) => setBaptismData({ ...baptismData, officiatingPriest: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block">የክርስትና አባት/እናት</label>
                  <input
                    type="text"
                    value={baptismData.godparent}
                    onChange={(e) => setBaptismData({ ...baptismData, godparent: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[12px]"
                  />
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
            
            {/* The Certificate A4 Sheet Canvas */}
            <div
              id="certificate-print-sheet"
              style={{
                transform: `translateX(${globalOffsetX}mm) translateY(${globalOffsetY}mm)`,
                fontSize: `${(fontSizeScale / 100) * 13}px`,
              }}
              className={`relative mx-auto w-full max-w-[960px] aspect-[1.316/1] rounded-lg border border-border shadow-2xl transition-all duration-150 overflow-hidden ${
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
              >
                {/* Fallback watermark only if image fails to load */}
                {!isWedding && (
                  <div className="absolute inset-0 flex flex-col items-center justify-between p-8 border-8 border-double border-amber-800/30 bg-amber-50/20">
                    <div className="text-center">
                      <p className="text-[12px] font-semibold text-amber-900/70 uppercase tracking-widest">
                        የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን
                      </p>
                      <p className="text-[10px] text-amber-800/60">
                        {baptismData.churchName}
                      </p>
                    </div>
                    <div className="text-center opacity-30">
                      <p className="text-[28px] font-serif font-bold text-amber-950">
                        የጥምቀት ምስክር ወረቀት
                      </p>
                    </div>
                    <div className="text-[9px] text-amber-800/50">
                      Canonical Baptism Certificate Ledger
                    </div>
                  </div>
                )}
              </div>

              {/* OVERLAY FIELD SYSTEM */}
              {isWedding ? (
                /* ======================================================== */
                /* MARRIAGE CERTIFICATE OVERLAY (MATCHED TO CHAGNI FORM)     */
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

                  {/* (Lines 6 & 7 are pre-printed: ቤ/ክ ቻግኒ ብርሃነ ገነት... / ሀገር ቻግኒ - ኢትዮጵያ) */}

                  {/* 8. ቀን */}
                  <div
                    style={{ left: "11%", top: "62.8%", width: "35%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.dateAmharic}
                  </div>

                  {/* 9. የ ፫ ምስክሮች ስም */}
                  {/* ሀ */}
                  <div
                    style={{ left: "24%", top: "66.5%", width: "23%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness1Amharic}
                  </div>
                  {/* ለ */}
                  <div
                    style={{ left: "22%", top: "70.5%", width: "25%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness2Amharic}
                  </div>
                  {/* ሐ */}
                  <div
                    style={{ left: "22%", top: "74.5%", width: "25%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.witness3Amharic}
                  </div>

                  {/* RIGHT COLUMN (ENGLISH FIELDS) */}
                  {/* 1. Name of bridegroom */}
                  <div
                    style={{ left: "64.5%", top: "29.2%", width: "25%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[13px] text-blue-950 print:text-black"
                  >
                    {weddingData.groomEnglish}
                  </div>

                  {/* 2. Nationality */}
                  <div
                    style={{ left: "59%", top: "33.0%", width: "30%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12.5px] text-blue-950 print:text-black"
                  >
                    {weddingData.groomNatEnglish}
                  </div>

                  {/* 3. Bride */}
                  <div
                    style={{ left: "55.5%", top: "36.8%", width: "33%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[13px] text-blue-950 print:text-black"
                  >
                    {weddingData.brideEnglish}
                  </div>

                  {/* 4. Performing priest */}
                  <div
                    style={{ left: "63.5%", top: "40.6%", width: "25%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.priestEnglish}
                  </div>

                  {/* 7. Date */}
                  <div
                    style={{ left: "55%", top: "54.2%", width: "33%" }}
                    className="absolute -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[12px] text-blue-950 print:text-black"
                  >
                    {weddingData.dateEnglish}
                  </div>

                  {/* 8. Witnesses (a, b, c) */}
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

                  {/* MIDDLE PARAGRAPH (AMHARIC CERTIFICATION STATEMENT) */}
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

                  {/* MIDDLE PARAGRAPH (ENGLISH CERTIFICATION STATEMENT) */}
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
                /* BAPTISM CERTIFICATE OVERLAY SYSTEM                       */
                /* ======================================================== */
                <div className="relative z-10 h-full w-full p-8 flex flex-col justify-between font-serif">
                  {/* Top Registry & Date */}
                  <div className="flex justify-between items-start pt-2">
                    <div>
                      <span className="text-[11px] font-bold text-amber-950/80 print:text-black">መለያ ቁጥር፦ </span>
                      <span className="font-mono font-bold text-[13px] text-primary print:text-black underline decoration-dotted">
                        {baptismData.certificateNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-amber-950/80 print:text-black">ቀን፦ </span>
                      <span className="font-bold text-[12px] text-primary print:text-black underline decoration-dotted">
                        {baptismData.issueDate}
                      </span>
                    </div>
                  </div>

                  {/* Center Content */}
                  <div className="my-auto space-y-4 px-6 text-center text-[14px] leading-loose text-slate-900 print:text-black">
                    <p>
                      የምዕመኑ/ኗ ሙሉ ስም፦{" "}
                      <span className="font-bold text-[16px] px-3 underline decoration-black decoration-1">
                        {baptismData.fullName}
                      </span>
                    </p>
                    <p>
                      የክርስትና ስም፦{" "}
                      <span className="font-bold text-[15px] text-amber-950 px-3 underline decoration-black decoration-1 print:text-black">
                        {baptismData.christianName}
                      </span>
                      {baptismData.dateOfBirth && (
                        <>
                          {"  "}የትውልድ ቀን፦{" "}
                          <span className="font-semibold px-2 underline decoration-black">
                            {baptismData.dateOfBirth}
                          </span>
                        </>
                      )}
                    </p>
                    <p>
                      የተጠመቁበት ቀን፦{" "}
                      <span className="font-bold underline decoration-black px-2">
                        {baptismData.sacramentDate}
                      </span>
                      {" • "}ያጠመቁት አባት ካህን፦{" "}
                      <span className="font-bold underline decoration-black px-2">
                        {baptismData.officiatingPriest}
                      </span>
                    </p>
                    <p>
                      የክርስትና አባት / እናት፦{" "}
                      <span className="font-bold underline decoration-black px-2">
                        {baptismData.godparent}
                      </span>
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-3 gap-6 pt-4 text-center text-[11px] text-slate-800 print:text-black">
                    <div>
                      <div className="mx-auto w-36 border-b border-black/60 pb-1 mb-1 font-semibold">
                        {baptismData.officiatingPriest}
                      </div>
                      <span className="text-[10px] uppercase text-slate-600 print:text-black">ያጠመቁት ካህን ፊርማ</span>
                    </div>
                    <div className="flex flex-col items-center justify-end">
                      <div className="h-11 w-11 rounded-full border border-dashed border-black/40 flex items-center justify-center text-[9px] text-slate-400 print:border-black/50 print:text-black">
                        ማኅተም
                      </div>
                      <span className="mt-1 text-[10px] uppercase text-slate-600 print:text-black">የቤተክርስቲያኑ ማኅተም</span>
                    </div>
                    <div>
                      <div className="mx-auto w-36 border-b border-black/60 pb-1 mb-1 font-semibold">
                        {baptismData.godparent}
                      </div>
                      <span className="text-[10px] uppercase text-slate-600 print:text-black">የክርስትና አባት/እናት ፊርማ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instruction tooltip below preview */}
            <p className="mt-3 text-center text-[11.5px] text-neutral-400 print:hidden">
              {isAmharic
                ? "💡 ፕሪንተር ላይ ስታስገቡ ኦሪጅናል ወረቀቱን ብቻ ያስገቡ፤ ጽሑፎቹ በየመስመሮቹ ላይ በትክክል ያርፋሉ።"
                : "💡 When printing onto physical paper, insert your church paper into the tray. Only text will print onto the blank lines."}
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

      {/* Global Print Stylesheet for exact A4 landscape print */}
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
