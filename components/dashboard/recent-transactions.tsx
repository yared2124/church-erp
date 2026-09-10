"use client";

import * as React from "react";
import { PiggyBank, Home, Boxes, Church, Wallet2, X, ArrowLeft, Tag, Calendar, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

interface TransactionRow {
  id: string;
  description: string;
  type: "Income" | "Expense";
  amount: string;
  transactionDate: string | Date;
  category: { name: string };
}

function iconFor(categoryName: string): { icon: LucideIcon; bg: string; color: string } {
  const name = categoryName.toLowerCase();
  if (name.includes("sebeka")) return { icon: PiggyBank, bg: "bg-success-bg", color: "text-success" };
  if (name.includes("rent")) return { icon: Home, bg: "bg-success-bg", color: "text-success" };
  if (name.includes("donation")) return { icon: Church, bg: "bg-success-bg", color: "text-success" };
  if (name.includes("office") || name.includes("supplies")) return { icon: Boxes, bg: "bg-danger-bg", color: "text-danger" };
  return { icon: Wallet2, bg: "bg-danger-bg", color: "text-danger" };
}

function formatRelativeTime(iso: string | Date) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function RecentTransactions({ transactions }: { transactions: TransactionRow[] }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";
  const [selected, setSelected] = React.useState<TransactionRow | null>(null);

  return (
    <>
      <Card hoverable className="xl:col-span-4 flex flex-col justify-between">
        <div>
          <CardHeader>
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <p className="mt-0.5 text-[12px] text-text-muted">Latest financial movements</p>
            </div>
            <a
              href="/finance/transactions"
              className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-primary transition-colors duration-150 hover:bg-primary-light"
            >
              View All
            </a>
          </CardHeader>

          {transactions.length === 0 ? (
            <EmptyState title="No transactions yet" description="Transactions will appear here once recorded." />
          ) : (
            <div className="flex flex-col">
              {transactions.slice(0, 4).map((t, i, arr) => {
                const { icon: Icon, bg, color } = iconFor(t.category.name);
                const positive = t.type === "Income";
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-background-alt/80 ${
                      i < arr.length - 1 ? "border-b border-border-light" : ""
                    }`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${bg}`}>
                      <Icon size={15} className={color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-text-primary">{t.description}</p>
                      <p className="text-[11.5px] text-text-secondary">{t.category.name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-[12px] font-semibold ${positive ? "text-success" : "text-danger"}`}>
                        {positive ? "+" : "-"}
                        {Number(t.amount).toLocaleString()} ETB
                      </p>
                      <p className="text-[11px] text-text-muted">{formatRelativeTime(t.transactionDate)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                    <h2 className="text-[16.5px] font-semibold text-text-primary">{selected.description}</h2>
                    <Badge tone={selected.type === "Income" ? "success" : "danger"}>
                      {selected.type === "Income" ? (isAmharic ? "ገቢ" : "Income") : (isAmharic ? "ወጪ" : "Expense")}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-text-secondary">
                    {selected.category.name}
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
                  {isAmharic ? "የገንዘብ መጠን" : "Amount"}
                </p>
                <p className={`text-[24px] font-bold mt-0.5 ${selected.type === "Income" ? "text-success" : "text-danger"}`}>
                  {selected.type === "Income" ? "+" : "-"}
                  {Number(selected.amount).toLocaleString()} <span className="text-[14px] font-medium text-text-primary">ETB</span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <Tag size={14} className="text-gold" />
                    <span className="text-[11.5px] font-medium">{isAmharic ? "ምድብ" : "Category"}</span>
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-text-primary">{selected.category.name}</div>
                </div>

                <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <Calendar size={14} className="text-gold" />
                    <span className="text-[11.5px] font-medium">{isAmharic ? "ቀንና ሰዓት" : "Date & Time"}</span>
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-text-primary">{formatDate(selected.transactionDate)}</div>
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

