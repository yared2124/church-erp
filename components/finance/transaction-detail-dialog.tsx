"use client";

import * as React from "react";
import {
  X,
  Calendar,
  Tag,
  DollarSign,
  CreditCard,
  User,
  FileText,
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";
import { paymentMethodLabel, type ApiTransaction, type TransactionStatus } from "@/features/finance/finance.types";

const statusTone: Record<TransactionStatus, BadgeTone> = {
  Paid: "success",
  Pending: "warning",
  Approved: "info",
  Rejected: "danger",
};

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface TransactionDetailDialogProps {
  transaction: ApiTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailDialog({ transaction, open, onOpenChange }: TransactionDetailDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  if (!open || !transaction) return null;

  const isIncome = transaction.type === "Income";

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
                <h2 className="text-[17px] font-semibold text-text-primary">
                  {transaction.description}
                </h2>
                <Badge tone={statusTone[transaction.status]}>{transaction.status}</Badge>
                <Badge tone={isIncome ? "success" : "danger"}>
                  {isIncome ? (isAmharic ? "ገቢ" : "Income") : (isAmharic ? "ወጪ" : "Expense")}
                </Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">
                {isAmharic ? "መለያ ቁጥር፦ " : "ID: "}
                <span className="font-mono font-medium text-text-primary">{transaction.id.slice(0, 8)}</span>
                {" • "}
                <span>{formatDate(transaction.transactionDate)}</span>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Amount Card */}
          <div className="mb-4 rounded-xl border border-border/80 bg-background-alt/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-text-secondary">
                  {isAmharic ? "የገንዘብ መጠን" : "Total Amount"}
                </p>
                <p className="text-[22px] font-bold text-text-primary mt-0.5">
                  {Number(transaction.amount).toLocaleString()} <span className="text-[14px] font-medium text-gold">ETB</span>
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isIncome ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
                {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <DetailField icon={Tag} label={isAmharic ? "ምድብ" : "Category"} value={transaction.category.name} />
            <DetailField icon={CreditCard} label={isAmharic ? "የክፍያ ዘዴ" : "Payment Method"} value={paymentMethodLabel(transaction.paymentMethod)} />
            <DetailField icon={Calendar} label={isAmharic ? "የተከናወነበት ቀን" : "Transaction Date"} value={formatDate(transaction.transactionDate)} />
            <DetailField icon={User} label={isAmharic ? "ያስመዘገበው ተጠቃሚ" : "Recorded By"} value={transaction.createdBy.name} />
          </div>
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
