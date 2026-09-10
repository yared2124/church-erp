"use client";

import * as React from "react";
import {
  X,
  User,
  Calendar,
  Church,
  MapPin,
  FileText,
  ArrowLeft,
  Cross,
  UserCheck,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { memberName, sacramentTitle, type ApiSacrament, type SacramentStatus } from "@/features/sacraments/sacrament.types";
import { useLanguage } from "@/lib/language-context";

const statusTone: Record<SacramentStatus, BadgeTone> = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface SacramentDetailDialogProps {
  record: ApiSacrament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SacramentDetailDialog({ record, open, onOpenChange }: SacramentDetailDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  if (!open || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface shadow-modal animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-primary/90 to-sidebar shadow-glow-gold">
              <EthiopicCross size={22} variant="gold" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] font-semibold text-text-primary">{sacramentTitle(record)}</h2>
                <Badge tone={statusTone[record.status]}>{record.status}</Badge>
                <Badge tone="info">{record.type}</Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">
                {isAmharic ? "ቀን፦ " : "Date: "}
                <span className="font-medium text-text-primary">{formatDate(record.date)}</span>
                {" • "}
                <span>{record.church}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <DetailField
              icon={User}
              label={record.type === "Marriage" ? (isAmharic ? "ሙሽራ (ባል)" : "Groom") : (isAmharic ? "ምዕመን" : "Primary Person")}
              value={memberName(record.primaryMember)}
            />
            {record.secondaryMember && (
              <DetailField
                icon={User}
                label={isAmharic ? "ሙሽሪት (ሚስት)" : "Bride"}
                value={memberName(record.secondaryMember)}
              />
            )}
            <DetailField
              icon={Calendar}
              label={isAmharic ? "የተከናወነበት ቀን" : "Sacrament Date"}
              value={formatDate(record.date)}
            />
            <DetailField
              icon={Church}
              label={isAmharic ? "ቤተክርስቲያን" : "Officiating Church"}
              value={record.church}
            />
            <DetailField
              icon={Cross}
              label={isAmharic ? "አከናወኝ ካህን" : "Officiating Priest"}
              value={record.priest?.name || "—"}
            />
            {record.sponsors && record.sponsors.length > 0 && (
              <DetailField
                icon={UserCheck}
                label={isAmharic ? "የክርስትና አባት/እናት ወይም ምስክር" : "Sponsors / Witnesses"}
                value={record.sponsors.map((s) => `${s.name}${s.relation ? ` (${s.relation})` : ""}`).join(", ")}
              />
            )}
            {record.notes && (
              <div className="sm:col-span-2">
                <DetailField
                  icon={FileText}
                  label={isAmharic ? "ተጨማሪ ማስታወሻ" : "Notes"}
                  value={record.notes}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer with BACK button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-alt/30 p-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            icon={<ArrowLeft size={16} />}
            className="rounded-lg border-border font-medium"
          >
            {isAmharic ? "ተመለስ (Back)" : "Back to Table"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-text-muted">
        <Icon size={14} className="text-gold" />
        <span className="text-[11.5px] font-medium">{label}</span>
      </div>
      <div className="mt-1 text-[13px] font-medium text-text-primary">{value}</div>
    </div>
  );
}
