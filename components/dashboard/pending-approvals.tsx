"use client";

import * as React from "react";
import { Wallet2, FileBadge2, X, ArrowLeft, User, DollarSign, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

interface PendingExpense {
  id: string;
  description: string;
  amount: string;
  createdBy: { name: string };
}

interface PendingCertRequest {
  id: string;
  type: "Baptism" | "Marriage" | "Burial";
  member: { firstName: string; lastName: string };
  requestedBy: { name: string };
}

interface PendingApprovalsProps {
  pendingExpenses: PendingExpense[];
  pendingCertRequests: PendingCertRequest[];
  className?: string;
}

type SelectedApproval =
  | { kind: "expense"; data: PendingExpense }
  | { kind: "cert"; data: PendingCertRequest }
  | null;

export function PendingApprovals({ pendingExpenses, pendingCertRequests, className }: PendingApprovalsProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";
  const [selected, setSelected] = React.useState<SelectedApproval>(null);

  const isEmpty = pendingExpenses.length === 0 && pendingCertRequests.length === 0;

  return (
    <>
      <Card hoverable className={cn("lg:col-span-4", className)}>
        <CardHeader>
          <div>
            <CardTitle>Pending Approvals</CardTitle>
            <p className="mt-0.5 text-[12px] text-text-muted">Requests requiring signature</p>
          </div>
          <a
            href="/finance/expenses"
            className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-primary transition-colors duration-150 hover:bg-primary-light"
          >
            View All
          </a>
        </CardHeader>

        {isEmpty ? (
          <EmptyState title="Nothing pending" description="New requests will show up here for review." />
        ) : (
          <div className="flex flex-col gap-0.5">
            {pendingExpenses.slice(0, 2).map((e) => (
              <div
                key={e.id}
                onClick={() => setSelected({ kind: "expense", data: e })}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-background-alt/80"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-warning-bg">
                  <Wallet2 size={15} className="text-warning" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-text-primary">Expense Request</p>
                  <p className="text-[11.5px] text-text-secondary">{e.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[12px] font-semibold text-text-primary">{Number(e.amount).toLocaleString()} ETB</p>
                  <p className="text-[11px] text-text-muted">By {e.createdBy.name}</p>
                </div>
              </div>
            ))}
            {pendingCertRequests.slice(0, 2).map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected({ kind: "cert", data: c })}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-background-alt/80"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-info-bg">
                  <FileBadge2 size={15} className="text-info" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-text-primary">Certificate Request</p>
                  <p className="text-[11.5px] text-text-secondary">{c.type} — {c.member.firstName} {c.member.lastName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-text-muted">By {c.requestedBy.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pop-up Modal Dialog with Back Button */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-modal animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border p-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-primary/90 to-sidebar shadow-glow-gold">
                  <EthiopicCross size={22} variant="gold" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[16.5px] font-semibold text-text-primary">
                      {selected.kind === "expense"
                        ? (isAmharic ? "የወጪ ማጽደቂያ ጥያቄ" : "Expense Approval")
                        : (isAmharic ? "የሰርቲፊኬት ማጽደቂያ ጥያቄ" : "Certificate Approval")}
                    </h2>
                    <Badge tone="warning">{isAmharic ? "በመጠባበቅ ላይ" : "Pending"}</Badge>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-text-secondary">
                    {selected.kind === "expense" ? selected.data.description : `${selected.data.type} Certificate`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                aria-label="Close modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {selected.kind === "expense" ? (
                <>
                  <div className="mb-4 rounded-xl border border-border/80 bg-background-alt/50 p-4">
                    <p className="text-[12px] font-medium text-text-secondary">
                      {isAmharic ? "የተጠየቀው የገንዘብ መጠን" : "Requested Amount"}
                    </p>
                    <p className="text-[24px] font-bold text-warning mt-0.5">
                      {Number(selected.data.amount).toLocaleString()} <span className="text-[14px] font-medium text-text-primary">ETB</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm sm:col-span-2">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <FileText size={14} className="text-gold" />
                        <span className="text-[11.5px] font-medium">{isAmharic ? "ማብራሪያ" : "Description"}</span>
                      </div>
                      <div className="mt-1 text-[13px] font-medium text-text-primary">{selected.data.description}</div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm sm:col-span-2">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <User size={14} className="text-gold" />
                        <span className="text-[11.5px] font-medium">{isAmharic ? "አመልካች" : "Requested By"}</span>
                      </div>
                      <div className="mt-1 text-[13px] font-medium text-text-primary">{selected.data.createdBy.name}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm sm:col-span-2">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <User size={14} className="text-gold" />
                      <span className="text-[11.5px] font-medium">{isAmharic ? "የምዕመን ስም" : "Member Name"}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-text-primary">
                      {selected.data.member.firstName} {selected.data.member.lastName}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <FileBadge2 size={14} className="text-gold" />
                      <span className="text-[11.5px] font-medium">{isAmharic ? "ዓይነት" : "Certificate Type"}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-text-primary">{selected.data.type}</div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <User size={14} className="text-gold" />
                      <span className="text-[11.5px] font-medium">{isAmharic ? "አመልካች" : "Requested By"}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-text-primary">{selected.data.requestedBy.name}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with BACK button */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-alt/30 p-4">
              <Button
                variant="secondary"
                onClick={() => setSelected(null)}
                icon={<ArrowLeft size={16} />}
                className="rounded-lg border-border font-medium"
              >
                {isAmharic ? "ተመለስ (Back)" : "Back to Dashboard"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

