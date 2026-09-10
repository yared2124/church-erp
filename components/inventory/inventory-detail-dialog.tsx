"use client";

import * as React from "react";
import {
  X,
  Package,
  Layers,
  MapPin,
  DollarSign,
  Boxes,
  ArrowLeft,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

type StockStatus = "InStock" | "LowStock" | "OutOfStock";
const statusTone: Record<StockStatus, BadgeTone> = {
  InStock: "success",
  LowStock: "warning",
  OutOfStock: "danger",
};
const statusLabel: Record<StockStatus, string> = {
  InStock: "In Stock",
  LowStock: "Low Stock",
  OutOfStock: "Out of Stock",
};

export interface ApiInventoryRecord {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
  location: string | null;
  status: StockStatus;
  category: { id: string; name: string };
}

interface InventoryDetailDialogProps {
  item: ApiInventoryRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryDetailDialog({ item, open, onOpenChange }: InventoryDetailDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  if (!open || !item) return null;

  const totalValue = item.quantity * Number(item.unitPrice);

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
                <h2 className="text-[17px] font-semibold text-text-primary">{item.name}</h2>
                <Badge tone={statusTone[item.status]}>{statusLabel[item.status]}</Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">
                {item.category.name}
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
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <DetailField icon={Package} label={isAmharic ? "የዕቃው ስም" : "Item Name"} value={item.name} />
            <DetailField icon={Layers} label={isAmharic ? "ምድብ" : "Category"} value={item.category.name} />
            <DetailField icon={Boxes} label={isAmharic ? "የዕቃው ብዛት" : "Quantity in Stock"} value={item.quantity} />
            <DetailField
              icon={DollarSign}
              label={isAmharic ? "ነጠላ ዋጋ" : "Unit Price"}
              value={`${Number(item.unitPrice).toLocaleString()} ETB`}
            />
            <DetailField
              icon={DollarSign}
              label={isAmharic ? "ጠቅላላ ዋጋ" : "Total Value"}
              value={`${totalValue.toLocaleString()} ETB`}
            />
            <DetailField icon={MapPin} label={isAmharic ? "የሚገኝበት ቦታ" : "Storage Location"} value={item.location ?? "—"} />
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
