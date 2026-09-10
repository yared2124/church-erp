"use client";

import * as React from "react";
import { Plus, X, Calendar, User, Heart, Cross, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { useLanguage } from "@/lib/language-context";

interface MemberOption {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  family?: { name: string } | null;
}

interface PriestSacramentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMemberId?: string;
  onSuccess?: () => void;
}

export function PriestSacramentDialog({
  open,
  onOpenChange,
  defaultMemberId,
  onSuccess,
}: PriestSacramentDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [tab, setTab] = React.useState<"Baptism" | "Marriage" | "Burial">("Baptism");
  const [members, setMembers] = React.useState<MemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = React.useState(true);

  const [primaryMemberId, setPrimaryMemberId] = React.useState(defaultMemberId || "");
  const [secondaryMemberId, setSecondaryMemberId] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [church, setChurch] = React.useState("St. Mary Church");
  const [sponsorName, setSponsorName] = React.useState("");
  const [sponsorRelation, setSponsorRelation] = React.useState("Godparent");
  const [notes, setNotes] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (defaultMemberId) {
      setPrimaryMemberId(defaultMemberId);
    }
  }, [defaultMemberId]);

  React.useEffect(() => {
    if (open) {
      setLoadingMembers(true);
      setError(null);
      setSuccess(false);
      apiFetch<{ data: MemberOption[] }>("/api/members?limit=100")
        .then((res) => setMembers(res.data))
        .catch(() => setMembers([]))
        .finally(() => setLoadingMembers(false));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!primaryMemberId) {
      setError(isAmharic ? "እባክዎ የንስሃ ልጅዎን ይምረጡ" : "Please select your spiritual child");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/sacraments/requests", {
        method: "POST",
        body: JSON.stringify({
          type: tab,
          primaryMemberId,
          ...(tab === "Marriage" && secondaryMemberId ? { secondaryMemberId } : {}),
          date,
          church,
          notes,
          ...(sponsorName
            ? {
                sponsors: [
                  {
                    name: sponsorName,
                    relation: sponsorRelation,
                  },
                ],
              }
            : {}),
        }),
      });

      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setNotes("");
        setSponsorName("");
      }, 2000);
    } catch (err: any) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-modal animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-[17px] font-bold text-text-primary">
              {isAmharic ? "የምስጢራት ማመልከቻ ማቅረቢያ" : "Pastoral Sacrament Request"}
            </h2>
            <p className="text-[13px] text-text-secondary">
              {isAmharic
                ? "ለአድሚን የክርስትና፣ የተክሊል ወይም የፍትሐት ማመልከቻ ያቅርቡ"
                : "Submit sacramental records to Admin for official certification"}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="my-4 flex items-center gap-3 rounded-xl border border-success/30 bg-success-bg p-4 text-[13.5px] font-medium text-success">
            <CheckCircle2 size={20} className="shrink-0 text-success" />
            <div>
              <p className="font-bold">
                {isAmharic ? "ማመልከቻው በተሳካ ሁኔታ ደርሷል!" : "Request Submitted Successfully!"}
              </p>
              <p className="text-[12.5px] opacity-90">
                {isAmharic
                  ? "አድሚኑ መርምሮ ሲያጸድቀው ይፋዊው ሰርቲፊኬት ይዘጋጃል።"
                  : "Admin will review and issue the official certificate."}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="my-4 rounded-xl border border-danger-bg bg-danger-bg p-3.5 text-[13px] text-danger">
            {error}
          </div>
        )}

        {/* Sacrament Tabs */}
        <div className="my-4 flex rounded-xl border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => {
              setTab("Baptism");
              setError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-semibold transition-all duration-150 ${
              tab === "Baptism"
                ? "bg-surface text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Cross size={15} className={tab === "Baptism" ? "text-gold" : "text-text-muted"} />
            <span>{isAmharic ? "ጥምቀት" : "Baptism"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("Marriage");
              setError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-semibold transition-all duration-150 ${
              tab === "Marriage"
                ? "bg-surface text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Heart size={15} className={tab === "Marriage" ? "text-primary" : "text-text-muted"} />
            <span>{isAmharic ? "ተክሊል (ጋብቻ)" : "Matrimony"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("Burial");
              setError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-semibold transition-all duration-150 ${
              tab === "Burial"
                ? "bg-surface text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <FileText size={15} className={tab === "Burial" ? "text-text-primary" : "text-text-muted"} />
            <span>{isAmharic ? "ዕረፍት / ፍትሐት" : "Burial / Repose"}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Primary Member (Spiritual Child) */}
          <Select
            label={
              tab === "Marriage"
                ? isAmharic
                  ? "ሙሽራ (የንስሃ ልጅዎ)"
                  : "Groom (Your Spiritual Child)"
                : tab === "Burial"
                ? isAmharic
                  ? "ያረፈው የንስሃ ልጅ"
                  : "Deceased Spiritual Child"
                : isAmharic
                ? "የሚጠመቀው የንስሃ ልጅ"
                : "Spiritual Child to Baptize"
            }
            required
            value={primaryMemberId}
            onChange={(e) => setPrimaryMemberId(e.target.value)}
            hint={loadingMembers ? (isAmharic ? "ልጆችዎን በመጫን ላይ..." : "Loading spiritual children...") : undefined}
            options={[
              { value: "", label: isAmharic ? "የንስሃ ልጅ ይምረጡ..." : "Select Spiritual Child..." },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.firstName} ${m.lastName}${m.phone ? ` (${m.phone})` : ""}`,
              })),
            ]}
          />

          {/* Secondary Member (Bride for Marriage) */}
          {tab === "Marriage" && (
            <Select
              label={isAmharic ? "ሙሽሪት (የምትጋባው አባል)" : "Bride (Partner Member)"}
              value={secondaryMemberId}
              onChange={(e) => setSecondaryMemberId(e.target.value)}
              options={[
                { value: "", label: isAmharic ? "ሙሽሪትን ይምረጡ (ካለ)..." : "Select Bride (optional)..." },
                ...members
                  .filter((m) => m.id !== primaryMemberId)
                  .map((m) => ({
                    value: m.id,
                    label: `${m.firstName} ${m.lastName}`,
                  })),
              ]}
            />
          )}

          {/* Date & Location */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label={
                tab === "Marriage"
                  ? isAmharic
                    ? "የተክሊል / የሰርግ ቀን"
                    : "Wedding Date"
                  : tab === "Burial"
                  ? isAmharic
                    ? "ያረፈበት ቀን"
                    : "Date of Repose"
                  : isAmharic
                  ? "የጥምቀት ቀን"
                  : "Baptism Date"
              }
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label={isAmharic ? "የተፈጸመበት / የሚፈጸምበት ቤተክርስቲያን" : "Church Parish"}
              value={church}
              onChange={(e) => setChurch(e.target.value)}
            />
          </div>

          {/* Sponsor / Witness / Godparent */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label={
                tab === "Baptism"
                  ? isAmharic
                    ? "የክርስትና አባት/እናት ስም"
                    : "Godparent Name"
                  : tab === "Marriage"
                  ? isAmharic
                    ? "የሚዜ / ምስክር ስም"
                    : "Best Man / Witness Name"
                  : isAmharic
                  ? "የቀብር ቦታ / መካነ መቃብር"
                  : "Cemetery / Burial Ground"
              }
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder={tab === "Burial" ? "e.g. ቅድስት ማርያም መካነ መቃብር" : "e.g. ወልደ ማርያም"}
            />
            <Input
              label={isAmharic ? "ዝምድና / ሚና" : "Relation / Role"}
              value={sponsorRelation}
              onChange={(e) => setSponsorRelation(e.target.value)}
              placeholder="e.g. Godparent / Witness"
            />
          </div>

          {/* Pastoral Notes */}
          <Textarea
            label={isAmharic ? "የካህኑ ማስታወሻ / ምርቃት" : "Pastoral Remarks & Blessing"}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isAmharic
                ? "ስለ ንስሃ ልጁ ተጨማሪ ማብራሪያ ወይም ማረጋገጫ..."
                : "Additional notes regarding confirmation or canonical permissions..."
            }
          />

          {/* Action Buttons */}
          <div className="mt-2 flex justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {isAmharic ? "ይቅር" : "Cancel"}
            </Button>
            <Button type="submit" loading={submitting}>
              {isAmharic ? "ጥያቄውን ለአድሚን ላክ" : "Submit to Admin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
