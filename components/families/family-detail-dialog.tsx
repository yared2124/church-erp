"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Users,
  Phone,
  MapPin,
  Calendar,
  Wallet2,
  ArrowLeft,
  ExternalLink,
  Shield,
  User,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { apiFetch } from "@/lib/api-client";
import { type ApiFamily, type ApiFamilyDetail, type SebekaStatus, memberFullName } from "@/features/families/family.types";
import { useLanguage } from "@/lib/language-context";

const sebekaTone: Record<SebekaStatus, BadgeTone> = {
  Paid: "success",
  Partial: "warning",
  Unpaid: "neutral",
  Overdue: "danger",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface FamilyDetailDialogProps {
  family: ApiFamily | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FamilyDetailDialog({ family, open, onOpenChange }: FamilyDetailDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [tab, setTab] = React.useState<"overview" | "members" | "payments">("overview");
  const [detail, setDetail] = React.useState<ApiFamilyDetail | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setTab("overview");
    setDetail(null);
    if (!family || !open) return;

    setLoading(true);
    fetch(`/api/families/${family.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setDetail(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [family, open]);

  if (!open || !family) return null;

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
                <h2 className="text-[17px] font-semibold text-text-primary">{family.name}</h2>
                <Badge tone={sebekaTone[family.sebekaStatus]}>
                  {family.sebekaStatus === "Paid" ? (isAmharic ? "ሰበካ የተከፈለ" : "Paid") : (isAmharic ? "ሰበካ ያልተከፈለ" : family.sebekaStatus)}
                </Badge>
                <Badge tone={family.status === "Active" ? "success" : "neutral"}>
                  {family.status === "Active" ? (isAmharic ? "ንቁ" : "Active") : (isAmharic ? "ያልነቃ" : "Inactive")}
                </Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">
                {isAmharic ? "የአባላት ብዛት፦ " : "Total Members: "}
                <strong className="font-medium text-text-primary">{detail ? detail.members.length : family._count.members}</strong>
                {family.phone && ` • ${family.phone}`}
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

        {/* Tab Selection */}
        <div className="flex border-b border-border bg-background-alt/50 px-5 pt-2">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`relative pb-2.5 px-3 text-[13px] font-medium transition-colors ${
              tab === "overview" ? "text-primary font-semibold" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isAmharic ? "የቤተሰብ መረጃ" : "Overview"}
            {tab === "overview" && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>

          <button
            type="button"
            onClick={() => setTab("members")}
            className={`relative pb-2.5 px-3 text-[13px] font-medium transition-colors ${
              tab === "members" ? "text-primary font-semibold" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isAmharic ? "የቤተሰብ አባላት" : "Family Members"}
            {tab === "members" && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>

          <button
            type="button"
            onClick={() => setTab("payments")}
            className={`relative pb-2.5 px-3 text-[13px] font-medium transition-colors ${
              tab === "payments" ? "text-primary font-semibold" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isAmharic ? "የሰበካ ክፍያዎች" : "Sebeka Payments"}
            {tab === "payments" && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-8 text-center text-[13px] text-text-muted">
              {isAmharic ? "መረጃውን በመጫን ላይ..." : "Loading family details..."}
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <DetailField icon={Users} label={isAmharic ? "የቤተሰብ ስም" : "Family Name"} value={family.name} />
                  <DetailField icon={Phone} label={isAmharic ? "ስልክ" : "Phone"} value={family.phone || "—"} />
                  <DetailField icon={Calendar} label={isAmharic ? "የምዝገባ ቀን" : "Registration Date"} value={formatDate(family.registrationDate)} />
                  <DetailField icon={Users} label={isAmharic ? "የአባላት ብዛት" : "Number of Members"} value={detail ? detail.members.length : family._count.members} />
                  <div className="sm:col-span-2">
                    <DetailField icon={MapPin} label={isAmharic ? "አድራሻ" : "Address"} value={family.address || "—"} />
                  </div>
                </div>
              )}

              {tab === "members" && (
                <div className="divide-y divide-border-light rounded-xl border border-border">
                  {(!detail || detail.members.length === 0) ? (
                    <div className="p-6 text-center text-text-muted text-[13px]">
                      {isAmharic ? "ምንም የተመዘገበ አባል የለም።" : "No members found."}
                    </div>
                  ) : (
                    detail.members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3.5">
                        <div>
                          <p className="text-[13px] font-medium text-text-primary">{memberFullName(m)}</p>
                          <p className="text-[11.5px] text-text-muted">{m.roleInFamily}</p>
                        </div>
                        <Badge tone={m.status === "Active" ? "success" : "neutral"}>{m.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "payments" && (
                <div className="divide-y divide-border-light rounded-xl border border-border">
                  {(!detail || detail.familyPayments.length === 0) ? (
                    <div className="p-6 text-center text-text-muted text-[13px]">
                      {isAmharic ? "ምንም የክፍያ ታሪክ የለም።" : "No payments recorded yet."}
                    </div>
                  ) : (
                    detail.familyPayments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3.5">
                        <div>
                          <p className="text-[13px] font-medium text-text-primary">{p.year} ዓ.ም. የሰበካ ጉባኤ</p>
                          <p className="text-[11.5px] text-text-muted">{formatDate(p.paymentDate)}</p>
                        </div>
                        <p className="text-[13px] font-semibold text-success">{Number(p.paidAmount).toLocaleString()} ETB</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
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

          <Link
            href={`/members/families/${family.id}`}
            className="inline-flex h-control-md items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-primary-hover shadow-sm"
          >
            <span>{isAmharic ? "ሙሉ ገጽ እይ" : "View Family Page"}</span>
            <ExternalLink size={13} />
          </Link>
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
