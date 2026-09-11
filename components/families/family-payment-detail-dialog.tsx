"use client";

import * as React from "react";
import {
  X,
  Calendar,
  Wallet2,
  FileText,
  User,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";
import { paymentMethodLabel, type ApiFamilyPayment, type PaymentStatus } from "@/features/family-payments/family-payment.types";

const statusTone: Record<PaymentStatus, BadgeTone> = {
  Paid: "success",
  Partial: "warning",
  Unpaid: "neutral",
  Overdue: "danger",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface FamilyPaymentDetailDialogProps {
  payment: ApiFamilyPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FamilyPaymentDetailDialog({ payment, open, onOpenChange }: FamilyPaymentDetailDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";
  const [imagePreviewOpen, setImagePreviewOpen] = React.useState(false);

  if (!open || !payment) return null;

  const expected = Number(payment.expectedAmount);
  const paid = Number(payment.paidAmount);
  const balance = expected - paid;
  const isPdf = payment.receiptUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-surface shadow-modal animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-primary/90 to-sidebar shadow-glow-gold">
              <EthiopicCross size={22} variant="gold" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[16px] font-semibold text-text-primary">
                  {isAmharic ? "የሰበካ ጉባኤ ደረሰኝ ዝርዝር" : "Sebeka Payment Receipt"}
                </h2>
                <Badge tone={statusTone[payment.status]}>
                  {payment.status === "Paid"
                    ? (isAmharic ? "የተከፈለ" : "Paid")
                    : payment.status === "Partial"
                    ? (isAmharic ? "ከፊል የተከፈለ" : "Partial")
                    : payment.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">
                {isAmharic ? "የደረሰኝ ቁጥር፦ " : "Receipt No: "}
                <strong className="font-semibold text-primary">{payment.receiptNumber || payment.id.slice(0, 8)}</strong>
                {" • "}
                <span>{payment.year} {isAmharic ? "ዓ.ም." : "G.C."}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Family Card */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-surface text-gold shadow-sm">
                <User size={18} />
              </div>
              <div>
                <p className="text-[11.5px] text-text-muted">{isAmharic ? "የቤተሰብ ስም" : "Family Name"}</p>
                <p className="text-[14px] font-semibold text-text-primary">{payment.family.name}</p>
              </div>
            </div>
            {payment.family.phone && (
              <div className="flex items-center gap-1 text-[12.5px] font-medium text-text-secondary">
                <Phone size={13} className="text-gold" />
                <span>{payment.family.phone}</span>
              </div>
            )}
          </div>

          {/* Key Receipt & Financial Details */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <DetailItem
              icon={FileText}
              label={isAmharic ? "የደረሰኝ / ሪሲት ቁጥር" : "Receipt Number"}
              value={<span className="font-bold text-primary">{payment.receiptNumber || payment.id.slice(0, 8)}</span>}
            />
            <DetailItem
              icon={Calendar}
              label={isAmharic ? "የተከፈለበት ቀን" : "Payment Date"}
              value={formatDate(payment.paymentDate)}
            />
            <DetailItem
              icon={CreditCard}
              label={isAmharic ? "የክፍያ ዘዴ" : "Payment Method"}
              value={paymentMethodLabel(payment.paymentMethod)}
            />
            <DetailItem
              icon={ShieldCheck}
              label={isAmharic ? "ያጸደቀው / የተመዘገበው በ" : "Recorded By (Cashier)"}
              value={payment.recordedBy?.name || (isAmharic ? "ዋና ካሸር" : "Cashier")}
            />
          </div>

          {/* Amount Breakdown */}
          <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm space-y-2.5">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-text-muted">
              {isAmharic ? "የክፍያ መጠን ዝርዝር" : "Amount Breakdown"}
            </p>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">{isAmharic ? "የሚጠበቅ መጠን" : "Expected Amount"}:</span>
              <span className="font-semibold text-text-primary">{expected.toLocaleString()} ETB</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">{isAmharic ? "የተከፈለ መጠን" : "Paid Amount"}:</span>
              <span className="font-bold text-success">{paid.toLocaleString()} ETB</span>
            </div>
            <div className="border-t border-border-light pt-2 flex items-center justify-between text-[13px]">
              <span className="font-medium text-text-secondary">{isAmharic ? "ቀሪ እዳ" : "Balance"}:</span>
              <span className={balance > 0 ? "font-bold text-danger" : "font-bold text-success"}>
                {balance <= 0 ? (isAmharic ? "ሙሉ ተከፍሏል" : "Fully Settled") : `${balance.toLocaleString()} ETB`}
              </span>
            </div>
          </div>

          {/* Receipt Photo / Attachment Preview */}
          {payment.receiptUrl ? (
            <div className="rounded-xl border border-gold/40 bg-gold/5 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-text-primary text-[12.5px] font-semibold">
                  <ImageIcon size={15} className="text-gold" />
                  <span>{isAmharic ? "የተያያዘ የደረሰኝ ፎቶ / ሰነድ" : "Attached Paper Receipt Photo"}</span>
                </div>
                {!isPdf && (
                  <button
                    type="button"
                    onClick={() => setImagePreviewOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11.5px] font-medium text-text-primary shadow-sm hover:bg-background-alt"
                  >
                    <Eye size={12} className="text-primary" />
                    <span>{isAmharic ? "አጉላ" : "Zoom"}</span>
                  </button>
                )}
              </div>

              {isPdf ? (
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2.5 text-[12.5px] font-medium text-primary hover:underline"
                >
                  <FileText size={16} />
                  <span>{isAmharic ? "ደረሰኙን በ PDF ክፈት" : "Open Receipt PDF"}</span>
                </a>
              ) : (
                <div
                  onClick={() => setImagePreviewOpen(true)}
                  className="group relative flex max-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-surface"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.receiptUrl}
                    alt="Paper receipt"
                    className="h-full max-h-48 w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-1.5 rounded-lg bg-surface/90 px-3 py-1.5 text-[12px] font-medium text-text-primary shadow-md">
                      <Eye size={14} />
                      <span>{isAmharic ? "ሙሉ ምስሉን እይ" : "View Full Image"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-3 text-center text-[12px] text-text-muted">
              {isAmharic ? "የደረሰኝ ፎቶ አልተያያዘም።" : "No receipt photo attached."}
            </div>
          )}

          {/* Notes if present */}
          {payment.notes && (
            <div className="rounded-xl border border-border bg-background-alt/30 p-3">
              <p className="text-[11.5px] font-medium text-text-muted">{isAmharic ? "ማስታወሻ" : "Notes"}</p>
              <p className="mt-0.5 text-[12.5px] text-text-primary">{payment.notes}</p>
            </div>
          )}
        </div>

        {/* Footer with BACK button */}
        <div className="flex items-center justify-between border-t border-border bg-background-alt/30 p-3.5 sm:p-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            icon={<ArrowLeft size={16} />}
            className="rounded-lg border-border font-medium"
          >
            {isAmharic ? "ተመለስ (Back)" : "Back to Table"}
          </Button>
          <div className="flex items-center gap-1.5 text-[11.5px] text-success">
            <CheckCircle2 size={14} />
            <span>{isAmharic ? "በካሸር የጸደቀ ክፍያ" : "Approved by Cashier"}</span>
          </div>
        </div>
      </div>

      {/* Full Size Image Preview Modal */}
      {imagePreviewOpen && payment.receiptUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setImagePreviewOpen(false)}
        >
          <div
            className="relative flex max-h-[92vh] max-w-3xl flex-col items-center justify-center rounded-2xl border border-border bg-surface p-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex w-full items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-gold" />
                <span className="text-[14px] font-semibold text-text-primary">
                  {isAmharic ? "የተቆረጠው ደረሰኝ ፎቶ፦ " : "Paper Receipt: "} {payment.receiptNumber || payment.id.slice(0, 8)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setImagePreviewOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-lg border border-border bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={payment.receiptUrl} alt="Receipt full" className="h-auto max-w-full rounded-lg object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface p-2.5 sm:p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-text-muted">
        <Icon size={14} className="text-gold" />
        <span className="text-[11.5px] font-medium">{label}</span>
      </div>
      <div className="mt-1 text-[13px] font-medium text-text-primary">{value}</div>
    </div>
  );
}
