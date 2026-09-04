"use client";

import * as React from "react";
import { UploadCloud, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept?: string;
  maxSizeLabel?: string;
  onFileSelected?: (file: File) => void;
}

/**
 * Drag-and-drop file upload zone. Genuinely new — nothing in the existing
 * design system covers file upload, and Bulk Import needs it.
 */
export function FileDropzone({ accept = ".csv,.xlsx,.xls", maxSizeLabel = "25MB", onFileSelected }: FileDropzoneProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    onFileSelected?.(f);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors duration-150",
          dragOver ? "border-primary bg-primary-light" : "border-border bg-background-alt"
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-light">
          <UploadCloud size={26} className="text-primary" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-text-primary">Drag &amp; drop your file here</p>
          <p className="text-[13px] text-text-secondary">or click to browse</p>
        </div>
        <Button type="button" onClick={() => inputRef.current?.click()}>
          Choose File
        </Button>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        <p className="text-[12px] text-text-muted">
          Supported formats: CSV, XLSX, XLS · Maximum file size: {maxSizeLabel}
        </p>
      </div>

      {file && (
        <div className="mt-3 flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
          <FileSpreadsheet size={18} className="shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-medium text-text-primary">{file.name}</p>
            <p className="text-[11.5px] text-text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-[12.5px] font-medium text-success">
            <CheckCircle2 size={14} /> File uploaded successfully
          </span>
          <button
            onClick={() => setFile(null)}
            aria-label="Remove file"
            className="shrink-0 rounded-md p-1 text-text-muted transition-colors duration-150 hover:bg-background-alt"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
