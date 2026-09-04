"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  User,
  VenetianMask,
  Cake,
  Phone,
  Mail,
  MapPin,
  Users,
  UserCheck,
  Droplet,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { memberFullName, type ApiMember } from "@/features/members/member.types";

const statusTone: Record<ApiMember["status"], BadgeTone> = {
  Active: "success",
  Inactive: "neutral",
  Transferred: "info",
  Deceased: "neutral",
};

const TABS = ["Overview", "Family", "Sacraments", "Payments"] as const;
type Tab = (typeof TABS)[number];

function age(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-text-muted" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-text-muted">{label}</p>
        <p className="text-[13.5px] font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

export function MemberDetailPanel({
  member,
  onClose,
}: {
  member: ApiMember | null;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState<Tab>("Overview");
  const [familyMembers, setFamilyMembers] = React.useState<ApiMember[] | null>(null);
  const [familyLoading, setFamilyLoading] = React.useState(false);
  const [familyError, setFamilyError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTab("Overview");
    setFamilyMembers(null);
  }, [member?.id]);

  React.useEffect(() => {
    if (tab !== "Family" || !member || familyMembers) return;
    setFamilyLoading(true);
    setFamilyError(null);
    apiFetch<Paginated<ApiMember>>(`/api/members?familyId=${member.familyId}&limit=50`)
      .then((res) => setFamilyMembers(res.data.filter((m) => m.id !== member.id)))
      .catch((err) => setFamilyError(err instanceof ApiClientError ? err.message : "Failed to load family members."))
      .finally(() => setFamilyLoading(false));
  }, [tab, member, familyMembers]);

  if (!member) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
        <User size={28} className="text-text-muted" />
        <p className="text-card-title text-text-primary">No member selected</p>
        <p className="max-w-[220px] text-small text-text-secondary">
          Select a row in the table to view full member details here.
        </p>
      </Card>
    );
  }

  const fullName = memberFullName(member);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-light px-5 pb-3 pt-5">
        <h3 className="text-card-title text-text-primary">Member Details</h3>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 pt-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light text-[16px] font-bold text-primary">
          {initials(fullName)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-bold text-text-primary">{fullName}</p>
            <Badge tone={statusTone[member.status]}>{member.status}</Badge>
          </div>
          <p className="text-[12.5px] text-text-secondary">{member.family.name}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-5 border-b border-border-light px-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative pb-2.5 text-[13.5px] font-medium transition-colors duration-150 ${
              tab === t ? "text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="px-5 py-2">
        {tab === "Overview" && (
          <div className="divide-y divide-border-light">
            <Field icon={User} label="Full Name" value={fullName} />
            <Field icon={VenetianMask} label="Gender" value={member.gender} />
            <Field icon={Cake} label="Date of Birth" value={`${formatDate(member.dateOfBirth)} (${age(member.dateOfBirth)} years)`} />
            <Field icon={Phone} label="Phone" value={member.phone ?? "—"} />
            <Field icon={Mail} label="Email" value={member.email ?? "—"} />
            <Field icon={MapPin} label="Address" value={member.address ?? "—"} />
            <Field icon={Users} label="Role in Family" value={member.roleInFamily} />
            {member.baptizedDate && <Field icon={Droplet} label="Baptized Date" value={formatDate(member.baptizedDate)} />}
            <Field icon={BadgeCheck} label="Membership Date" value={formatDate(member.membershipDate)} />
          </div>
        )}

        {tab === "Family" && (
          <div className="py-2">
            <p className="mb-2 text-[12.5px] font-semibold text-text-secondary">{member.family.name}</p>
            {familyLoading ? (
              <p className="py-6 text-center text-small text-text-secondary">Loading family members…</p>
            ) : familyError ? (
              <p className="py-6 text-center text-small text-danger">{familyError}</p>
            ) : !familyMembers || familyMembers.length === 0 ? (
              <p className="py-6 text-center text-small text-text-secondary">No other family members on record.</p>
            ) : (
              <div className="divide-y divide-border-light">
                {familyMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-[11px] font-bold text-primary">
                      {initials(memberFullName(m))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-text-primary">{memberFullName(m)}</p>
                      <p className="text-[11.5px] text-text-muted">{m.roleInFamily}</p>
                    </div>
                    <Badge tone={statusTone[m.status]}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "Sacraments" && (
          <div className="py-6 text-center text-small text-text-secondary">
            Baptism, marriage, and burial records for this member will appear here once the
            Sacraments module is connected to the database (Phase 4).
          </div>
        )}

        {tab === "Payments" && (
          <div className="py-6 text-center text-small text-text-secondary">
            Sebeka Gubae payments belong to this member&apos;s family — see the family&apos;s
            Payments tab, or Financial Management → Sebeka Payments.
          </div>
        )}
      </div>

      <div className="border-t border-border-light px-5 py-4">
        <Link
          href={`/members/${member.id}`}
          className="flex items-center justify-center gap-1.5 text-[13.5px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover"
        >
          View Full Profile
          <ArrowRight size={15} />
        </Link>
      </div>
    </Card>
  );
}
