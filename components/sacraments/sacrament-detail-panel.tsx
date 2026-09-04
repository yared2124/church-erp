"use client";

import * as React from "react";
import { X, User, Users2, Calendar, Church, UserCheck, MapPin, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { memberName, sacramentTitle, type ApiSacrament, type SacramentStatus, type SacramentType } from "@/features/sacraments/sacrament.types";

const statusTone: Record<SacramentStatus, BadgeTone> = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

const TABS = ["Overview", "Sponsors", "Documents", "History"] as const;
type Tab = (typeof TABS)[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function typeLabel(type: SacramentType) {
  return type;
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

export function SacramentDetailPanel({
  record,
  onClose,
}: {
  record: ApiSacrament | null;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState<Tab>("Overview");

  React.useEffect(() => setTab("Overview"), [record?.id]);

  if (!record) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
        <Church size={28} className="text-text-muted" />
        <p className="text-card-title text-text-primary">No record selected</p>
        <p className="max-w-[220px] text-small text-text-secondary">
          Select a row in the table to view full details here.
        </p>
      </Card>
    );
  }

  const title = sacramentTitle(record);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-light px-5 pb-3 pt-5">
        <h3 className="text-card-title text-text-primary">{typeLabel(record.type)} Details</h3>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 pt-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light text-[14px] font-bold text-primary">
          {initials(title)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-bold text-text-primary">{title}</p>
            <Badge tone={statusTone[record.status]}>{record.status}</Badge>
          </div>
          <p className="text-[12.5px] text-text-secondary">{record.id.slice(0, 8)}</p>
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
            <Field icon={User} label={record.secondaryMember ? "Groom" : "Name"} value={memberName(record.primaryMember)} />
            {record.secondaryMember && <Field icon={User} label="Bride" value={memberName(record.secondaryMember)} />}
            <Field icon={Users2} label="Gender" value={record.primaryMember.gender} />
            <Field icon={Calendar} label={`${typeLabel(record.type)} Date`} value={formatDate(record.date)} />
            <Field icon={Church} label="Church" value={record.church} />
            <Field icon={UserCheck} label="Priest" value={record.priest?.name ?? "—"} />
            <Field icon={MapPin} label="Family" value={record.family?.name ?? "—"} />
            <Field icon={UserCheck} label="Registered By" value={record.registeredBy.name} />
            <Field icon={Calendar} label="Registration Date" value={formatDate(record.createdAt)} />
            {record.notes && <Field icon={FileText} label="Notes" value={record.notes} />}
          </div>
        )}

        {tab === "Sponsors" && (
          <div className="py-2">
            {record.sponsors.length === 0 ? (
              <p className="py-6 text-center text-small text-text-secondary">No sponsors on record.</p>
            ) : (
              <div className="divide-y divide-border-light">
                {record.sponsors.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-[11px] font-bold text-primary">
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-text-primary">{s.name}</p>
                      <p className="text-[11.5px] text-text-muted">{s.relation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "Documents" && (
          <div className="py-6 text-center text-small text-text-secondary">
            Scanned certificates and supporting documents for this record will appear here once
            document storage is connected.
          </div>
        )}

        {tab === "History" && (
          <div className="py-6 text-center text-small text-text-secondary">
            Approval and edit history for this record will appear here once Audit Logs are
            connected to this record.
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-border-light px-5 py-4">
        <Button variant="secondary" size="sm" className="flex-1">
          Edit {typeLabel(record.type)}
        </Button>
        <Button variant="danger" size="sm" className="flex-1">
          Delete
        </Button>
      </div>
    </Card>
  );
}
