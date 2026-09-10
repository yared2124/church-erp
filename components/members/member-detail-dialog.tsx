"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Shield,
  Droplet,
  BadgeCheck,
  Cross,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { apiFetch, type Paginated } from "@/lib/api-client";
import { useLanguage } from "@/lib/language-context";
import { memberFullName, type ApiMember } from "@/features/members/member.types";

const statusTone: Record<ApiMember["status"], BadgeTone> = {
  Active: "success",
  Inactive: "neutral",
  Transferred: "info",
  Deceased: "neutral",
};

const roleTranslations: Record<string, string> = {
  Head: "የቤተሰብ ኃላፊ (Head)",
  Wife: "እናት / ሚስት (Wife)",
  Husband: "አባት / ባል (Husband)",
  Son: "ወንድ ልጅ (Son)",
  Daughter: "ሴት ልጅ (Daughter)",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function age(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
}

interface MemberDetailDialogProps {
  member: ApiMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestSacrament?: (memberId: string) => void;
}

export function MemberDetailDialog({
  member,
  open,
  onOpenChange,
  onRequestSacrament,
}: MemberDetailDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [activeTab, setActiveTab] = React.useState<"overview" | "spiritual" | "family">("overview");
  const [familyMembers, setFamilyMembers] = React.useState<ApiMember[] | null>(null);
  const [familyLoading, setFamilyLoading] = React.useState(false);

  React.useEffect(() => {
    setActiveTab("overview");
    setFamilyMembers(null);
  }, [member?.id, open]);

  React.useEffect(() => {
    if (activeTab === "family" && member && !familyMembers) {
      setFamilyLoading(true);
      apiFetch<Paginated<ApiMember>>(`/api/members?familyId=${member.familyId}&limit=50`)
        .then((res) => {
          setFamilyMembers(res.data.filter((m) => m.id !== member.id));
        })
        .catch(() => {
          setFamilyMembers([]);
        })
        .finally(() => setFamilyLoading(false));
    }
  }, [activeTab, member, familyMembers]);

  if (!open || !member) return null;

  const fullName = `${member.firstName} ${member.middleName ? `${member.middleName} ` : ""}${member.lastName}`;
  const sebekaPaid = member.family?.sebekaStatus === "Paid";

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
                <h2 className="text-[17px] font-semibold text-text-primary">{fullName}</h2>
                <Badge tone={statusTone[member.status]}>{member.status}</Badge>
                <Badge tone={sebekaPaid ? "success" : "warning"}>
                  {sebekaPaid ? (isAmharic ? "ሰበካ የተከፈለ" : "Sebeka Paid") : (isAmharic ? "ሰበካ ያልተከፈለ" : "Sebeka Unpaid")}
                </Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">
                {isAmharic ? "የቤተሰብ ስም፦ " : "Family: "}
                <span className="font-medium text-text-primary">{member.family?.name || "—"}</span>
                {" • "}
                <span>{roleTranslations[member.roleInFamily] || member.roleInFamily}</span>
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
            onClick={() => setActiveTab("overview")}
            className={`relative pb-2.5 px-3 text-[13px] font-medium transition-colors ${
              activeTab === "overview"
                ? "text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isAmharic ? "አጠቃላይ መረጃ" : "Overview"}
            {activeTab === "overview" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("spiritual")}
            className={`relative pb-2.5 px-3 text-[13px] font-medium transition-colors ${
              activeTab === "spiritual"
                ? "text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isAmharic ? "መንፈሳዊ መረጃ" : "Spiritual Life"}
            {activeTab === "spiritual" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("family")}
            className={`relative pb-2.5 px-3 text-[13px] font-medium transition-colors ${
              activeTab === "family"
                ? "text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isAmharic ? "የቤተሰብ አባላት" : "Family Members"}
            {activeTab === "family" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <DetailField
                icon={User}
                label={isAmharic ? "ሙሉ ስም" : "Full Name"}
                value={fullName}
              />
              <DetailField
                icon={Users}
                label={isAmharic ? "በቤተሰብ ውስጥ ያለው ሚና" : "Role in Family"}
                value={roleTranslations[member.roleInFamily] || member.roleInFamily}
              />
              <DetailField
                icon={Calendar}
                label={isAmharic ? "ዕድሜ እና የልደት ቀን" : "Age & Date of Birth"}
                value={`${formatDate(member.dateOfBirth)} (${age(member.dateOfBirth)} ${isAmharic ? "ዓመት" : "years"})`}
              />
              <DetailField
                icon={User}
                label={isAmharic ? "ጾታ" : "Gender"}
                value={member.gender === "Male" ? (isAmharic ? "ወንድ" : "Male") : (isAmharic ? "ሴት" : "Female")}
              />
              <DetailField
                icon={Phone}
                label={isAmharic ? "ስልክ ቁጥር" : "Phone Number"}
                value={member.phone || "—"}
              />
              <DetailField
                icon={Mail}
                label={isAmharic ? "ኢሜይል" : "Email Address"}
                value={member.email || "—"}
              />
              <div className="sm:col-span-2">
                <DetailField
                  icon={MapPin}
                  label={isAmharic ? "የመኖሪያ አድራሻ" : "Residential Address"}
                  value={member.address || "—"}
                />
              </div>
            </div>
          )}

          {activeTab === "spiritual" && (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <DetailField
                icon={Cross}
                label={isAmharic ? "የንስሃ አባት" : "Confessor Priest"}
                value={
                  member.confessorPriest ? (
                    <span className="font-semibold text-primary">
                      {member.confessorPriest.name}
                    </span>
                  ) : (
                    <span className="text-text-muted">
                      {isAmharic ? "አልተመዘገበም" : "Not Assigned"}
                    </span>
                  )
                }
              />
              <DetailField
                icon={Shield}
                label={isAmharic ? "የሰበካ ጉባኤ ክፍያ ሁኔታ" : "Sebeka Contribution"}
                value={
                  <Badge tone={sebekaPaid ? "success" : "warning"}>
                    {sebekaPaid
                      ? (isAmharic ? "የተከፈለ" : "Paid")
                      : (isAmharic ? "ያልተከፈለ" : "Unpaid")}
                  </Badge>
                }
              />
              <DetailField
                icon={Droplet}
                label={isAmharic ? "የክርስትና / የጥምቀት ቀን" : "Baptism Date"}
                value={formatDate(member.baptizedDate)}
              />
              <DetailField
                icon={BadgeCheck}
                label={isAmharic ? "አባል የሆነበት ቀን" : "Membership Date"}
                value={formatDate(member.membershipDate)}
              />
            </div>
          )}

          {activeTab === "family" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-medium text-text-secondary">
                  {isAmharic ? "የቤተሰብ ስም፦ " : "Family: "}
                  <strong className="text-text-primary">{member.family?.name}</strong>
                </p>
              </div>

              {familyLoading ? (
                <div className="py-8 text-center text-[13px] text-text-muted">
                  {isAmharic ? "የቤተሰብ አባላትን በመጫን ላይ..." : "Loading family members..."}
                </div>
              ) : !familyMembers || familyMembers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-8 text-center text-[13px] text-text-muted">
                  {isAmharic ? "ሌሎች የተመዘገቡ የቤተሰብ አባላት የሉም።" : "No other family members recorded."}
                </div>
              ) : (
                <div className="divide-y divide-border-light rounded-xl border border-border">
                  {familyMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-[13px] font-medium text-text-primary">
                          {memberFullName(m)}
                        </p>
                        <p className="text-[11.5px] text-text-muted">
                          {roleTranslations[m.roleInFamily] || m.roleInFamily}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={statusTone[m.status]}>{m.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Clear BACK Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-alt/30 p-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            icon={<ArrowLeft size={16} />}
            className="rounded-lg border-border font-medium"
          >
            {isAmharic ? "ተመለስ (Back)" : "Back to Table"}
          </Button>

          <div className="flex items-center gap-2">
            {onRequestSacrament && (
              <Button
                variant="secondary"
                onClick={() => {
                  onOpenChange(false);
                  onRequestSacrament(member.id);
                }}
                icon={<Cross size={14} className="text-gold" />}
                className="rounded-lg text-[12.5px]"
              >
                {isAmharic ? "የምስጢራት ጥያቄ" : "Request Sacrament"}
              </Button>
            )}

            <Link
              href={`/members/${member.id}`}
              className="inline-flex h-control-md items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-primary-hover shadow-sm"
            >
              <span>{isAmharic ? "ሙሉ ገጽ እይ" : "View Full Profile"}</span>
              <ExternalLink size={13} />
            </Link>
          </div>
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
