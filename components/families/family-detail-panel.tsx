"use client";

import * as React from "react";
import Link from "next/link";
import { X, Users, Phone, MapPin, Calendar, UserCheck, Wallet2, ArrowRight, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { memberFullName } from "@/features/families/family.types";
import type { ApiFamily, ApiFamilyDetail, SebekaStatus } from "@/features/families/family.types";

const sebekaTone: Record<SebekaStatus, BadgeTone> = {
  Paid: "success",
  Partial: "warning",
  Unpaid: "neutral",
  Overdue: "danger",
};

const TABS = ["Overview", "Members", "Payments", "Sacraments", "History"] as const;
type Tab = (typeof TABS)[number];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
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

export function FamilyDetailPanel({ family, onClose }: { family: ApiFamily | null; onClose: () => void }) {
  const [tab, setTab] = React.useState<Tab>("Overview");
  const [detail, setDetail] = React.useState<ApiFamilyDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTab("Overview");
    setDetail(null);
    if (!family) return;

    setLoading(true);
    setError(null);
    apiFetch<{ data: ApiFamilyDetail }>(`/api/families/${family.id}`)
      .then((res) => setDetail(res.data))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load family details."))
      .finally(() => setLoading(false));
  }, [family]);

  if (!family) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
        <Home size={28} className="text-text-muted" />
        <p className="text-card-title text-text-primary">No family selected</p>
        <p className="max-w-[220px] text-small text-text-secondary">
          Select a row in the table to view full family details here.
        </p>
      </Card>
    );
  }

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-light px-5 pb-3 pt-5">
        <h3 className="text-card-title text-text-primary">Family Details</h3>
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
          {initials(family.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-bold text-text-primary">{family.name}</p>
            <Badge tone={sebekaTone[family.sebekaStatus]}>{family.sebekaStatus}</Badge>
          </div>
          <p className="text-[12.5px] text-text-secondary">{family.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto border-b border-border-light px-5 scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative shrink-0 pb-2.5 text-[13.5px] font-medium transition-colors duration-150 ${
              tab === t ? "text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="px-5 py-2">
        {error ? (
          <p className="py-6 text-center text-small text-danger">{error}</p>
        ) : loading || !detail ? (
          <div className="flex flex-col gap-2 py-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        ) : (
          <>
            {tab === "Overview" && (
              <div className="divide-y divide-border-light">
                <Field icon={Users} label="Family Name" value={detail.name} />
                <Field icon={Phone} label="Phone" value={detail.phone ?? "—"} />
                <Field icon={MapPin} label="Address" value={detail.address ?? "—"} />
                <Field icon={Calendar} label="Registration Date" value={formatDate(detail.registrationDate)} />
                <Field icon={Users} label="Number of Members" value={detail.members.length} />
                <Field
                  icon={Wallet2}
                  label="Sebeka Payment Status"
                  value={<Badge tone={sebekaTone[detail.sebekaStatus]}>{detail.sebekaStatus}</Badge>}
                />
              </div>
            )}

            {tab === "Members" && (
              <div className="divide-y divide-border-light py-2">
                {detail.members.length === 0 ? (
                  <p className="py-6 text-center text-small text-text-secondary">No members recorded yet.</p>
                ) : (
                  detail.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 py-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-[11px] font-bold text-primary">
                        {initials(memberFullName(m))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-text-primary">{memberFullName(m)}</p>
                        <p className="text-[11.5px] text-text-muted">{m.roleInFamily}</p>
                      </div>
                      <Badge tone={m.status === "Active" ? "success" : "neutral"}>{m.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "Payments" && (
              <div className="py-2">
                {detail.familyPayments.length === 0 ? (
                  <p className="py-6 text-center text-small text-text-secondary">No payment records yet.</p>
                ) : (
                  <div className="divide-y divide-border-light">
                    {detail.familyPayments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2.5">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-text-primary">{p.year} Sebeka</p>
                          <p className="text-[11.5px] text-text-muted">{p.id.slice(0, 8)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-semibold text-text-primary">
                            {Number(p.paidAmount).toLocaleString()} ETB
                          </p>
                          <Badge tone={sebekaTone[p.status]}>{p.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "Sacraments" && (
              <div className="py-6 text-center text-small text-text-secondary">
                Sacrament records for members of this family will appear here once the Sacraments
                module is connected to the database.
              </div>
            )}

            {tab === "History" && (
              <div className="py-6 text-center text-small text-text-secondary">
                Family-related activity will appear here once this panel links into Audit Logs
                filtered by entity = Family.
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-border-light px-5 py-4">
        <Link
          href={`/members/families/${family.id}`}
          className="flex items-center justify-center gap-1.5 text-[13.5px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover"
        >
          View Full Profile
          <ArrowRight size={15} />
        </Link>
      </div>
    </Card>
  );
}
