"use client";

import * as React from "react";
import { Home, User, DollarSign, X, ArrowLeft, Building } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

interface OverdueRentPayment {
  id: string;
  amount: string;
  leaseAgreement: { tenant: { name: string }; property: { unitName: string } };
}

export function OverdueRentals({ rentals, className }: { rentals: OverdueRentPayment[]; className?: string }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";
  const [selected, setSelected] = React.useState<OverdueRentPayment | null>(null);

  return (
    <>
      <Card hoverable className={cn("lg:col-span-4", className)}>
        <CardHeader>
          <div>
            <CardTitle>Overdue Rentals</CardTitle>
            <p className="mt-0.5 text-[12px] text-text-muted">Uncollected property dues</p>
          </div>
          <a
            href="/property"
            className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-primary transition-colors duration-150 hover:bg-primary-light"
          >
            View All
          </a>
        </CardHeader>
        {rentals.length === 0 ? (
          <EmptyState title="No overdue rentals" description="All rental accounts are up to date." />
        ) : (
          <div className="flex flex-col gap-0.5">
            {rentals.slice(0, 3).map((r) => (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-background-alt/80"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-danger-bg">
                  <Home size={15} className="text-danger" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-text-primary">{r.leaseAgreement.property.unitName}</p>
                  <p className="text-[11.5px] text-text-secondary">{r.leaseAgreement.tenant.name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[12px] font-semibold text-text-primary">{Number(r.amount).toLocaleString()} ETB</p>
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
                      {selected.leaseAgreement.property.unitName}
                    </h2>
                    <Badge tone="danger">{isAmharic ? "ያለፈበት" : "Overdue"}</Badge>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-text-secondary">
                    {isAmharic ? "ተከራይ፦ " : "Tenant: "}{selected.leaseAgreement.tenant.name}
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
              <div className="mb-4 rounded-xl border border-border/80 bg-background-alt/50 p-4">
                <p className="text-[12px] font-medium text-text-secondary">
                  {isAmharic ? "ያልተከፈለ መጠን" : "Overdue Amount"}
                </p>
                <p className="text-[24px] font-bold text-danger mt-0.5">
                  {Number(selected.amount).toLocaleString()} <span className="text-[14px] font-medium text-text-primary">ETB</span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <Building size={14} className="text-gold" />
                    <span className="text-[11.5px] font-medium">{isAmharic ? "የቤቱ/ክፍሉ መለያ" : "Property Unit"}</span>
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-text-primary">{selected.leaseAgreement.property.unitName}</div>
                </div>

                <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <User size={14} className="text-gold" />
                    <span className="text-[11.5px] font-medium">{isAmharic ? "ተከራይ" : "Tenant"}</span>
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-text-primary">{selected.leaseAgreement.tenant.name}</div>
                </div>
              </div>
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

