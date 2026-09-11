"use client";

import * as React from "react";
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, Eye, FileText, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface ReceiptUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ReceiptUploader({ value, onChange, disabled }: ReceiptUploaderProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const uploadFile = async (file: File) => {
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError(isAmharic ? "የፋይሉ መጠን ከ8MB መብለጥ የለበትም።" : "File size cannot exceed 8MB.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setError(isAmharic ? "እባክዎ ትክክለኛ ምስል (JPG, PNG) ወይም PDF ያስገቡ።" : "Please upload a valid image or PDF.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || (isAmharic ? "ፋይሉን መጫን አልተቻለም።" : "Upload failed"));
      }

      onChange(json.url);
    } catch (err: any) {
      setError(err.message || (isAmharic ? "ፋይሉን መጫን አልተቻለም።" : "Failed to upload file."));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-text-primary">
        {isAmharic ? "የተከፈለበት ደረሰኝ / ሪሲት ፎቶ (አማራጭ)" : "Receipt Attachment / Photo (Optional)"}
      </label>

      {value ? (
        <div className="relative flex items-center justify-between overflow-hidden rounded-xl border border-gold/40 bg-gold/5 p-3.5 transition-all">
          <div className="flex items-center gap-3">
            {isPdf ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-surface text-gold shadow-sm">
                <FileText size={24} />
              </div>
            ) : (
              <div
                onClick={() => setPreviewOpen(true)}
                className="group relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-surface shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="Receipt preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Eye size={16} className="text-white" />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                <p className="text-[13px] font-semibold text-text-primary">
                  {isAmharic ? "የደረሰኝ ፎቶ ተያይዟል" : "Receipt attached"}
                </p>
              </div>
              <p className="text-[11.5px] text-text-secondary">
                {isPdf ? "PDF Document" : (isAmharic ? "ፎቶውን ለማየት ይጫኑ" : "Click image to preview")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPdf && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-text-primary shadow-sm transition-colors hover:bg-background-alt"
              >
                <Eye size={14} className="text-primary" />
                <span>{isAmharic ? "ሙሉ እይ" : "View"}</span>
              </button>
            )}

            {isPdf && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-text-primary shadow-sm transition-colors hover:bg-background-alt"
              >
                <Eye size={14} className="text-primary" />
                <span>{isAmharic ? "ክፈት" : "Open PDF"}</span>
              </a>
            )}

            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove receipt"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 text-danger transition-colors hover:bg-danger-bg"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-150 ${
            dragOver
              ? "border-gold bg-gold/10 scale-[1.01]"
              : "border-border hover:border-gold/60 hover:bg-background-alt/50"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                uploadFile(e.target.files[0]);
              }
            }}
            disabled={disabled || uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 size={26} className="animate-spin text-primary" />
              <p className="text-[13px] font-medium text-text-primary">
                {isAmharic ? "ደረሰኙ እየተጫነ ነው..." : "Uploading receipt..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-gold shadow-sm">
                <UploadCloud size={20} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-text-primary">
                  {isAmharic
                    ? "የደረሰኙን ፎቶ እዚህ ይጎትቱ ወይም ፋይል ለመምረጥ ይጫኑ"
                    : "Drag and drop receipt photo here, or click to browse"}
                </p>
                <p className="mt-0.5 text-[11.5px] text-text-muted">
                  {isAmharic ? "JPG, PNG, WEBP ወይም PDF (እስከ 8MB)" : "JPG, PNG, WEBP or PDF (up to 8MB)"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[12px] font-medium text-danger">{error}</p>
      )}

      {/* Full Preview Modal */}
      {previewOpen && value && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-2xl flex-col items-center justify-center rounded-2xl border border-border bg-surface p-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex w-full items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-gold" />
                <span className="text-[14px] font-semibold text-text-primary">
                  {isAmharic ? "የደረሰኝ ፎቶ እይታ" : "Receipt Photo Preview"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-lg border border-border bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Full receipt" className="h-auto max-w-full rounded-lg object-contain" />
            </div>

            <div className="mt-3 flex w-full justify-end">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg border border-border px-3.5 py-1.5 text-[12.5px] font-medium text-text-secondary transition-colors hover:bg-background-alt hover:text-text-primary"
              >
                {isAmharic ? "ዝጋ" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
