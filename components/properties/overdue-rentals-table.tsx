"use client";

import * as React from "react";
import { Eye, AlertCircle, Phone, Home, X, ArrowLeft } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

interface OverduePayment {
  id: string;
  amount: number | string;
  createdAt: string;
  leaseAgreement: {
    tenant: { name: string; phone: string | null; email: string | null };
    property: { unitName: string };
  };
}

export function OverdueRentalsTable({ overduePayments }: { overduePayments: OverduePayment[] }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [search, setSearch] = React.useState("");
  const [selectedPayment, setSelectedPayment] = React.useState<OverduePayment | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return overduePayments.filter((p) => {
      return p.leaseAgreement.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        p.leaseAgreement.property.unitName.toLowerCase().includes(search.toLowerCase());
    });
  }, [overduePayments, search]);

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isAmharic ? "ያለፈባቸውን ተከራይ ወይም ቤት ፈልግ..." : "Search overdue tenant or unit..."}
        onClearFilters={() => setSearch("")}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isAmharic ? "ተከራይ" : "Tenant"}</TableHead>
              <TableHead>{isAmharic ? "ስልክ" : "Phone"}</TableHead>
              <TableHead>{isAmharic ? "የተከራየው ቤት" : "Property Unit"}</TableHead>
              <TableHead>{isAmharic ? "ያልተከፈለ መጠን" : "Overdue Amount"}</TableHead>
              <TableHead>{isAmharic ? "ያለፈበት ጊዜ" : "Overdue Since"}</TableHead>
              <TableHead className="text-right">{isAmharic ? "ተግባር" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-text-muted">
                  {isAmharic ? "ምንም ያለፈበት የኪራይ እዳ የለም።" : "No overdue rentals found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow
                  key={p.id}
                  onClick={() => {
                    setSelectedPayment(p);
                    setDetailOpen(true);
                  }}
                  className="cursor-pointer transition-colors hover:bg-background-alt/60"
                >
                  <TableCell className="font-semibold text-text-primary">{p.leaseAgreement.tenant.name}</TableCell>
                  <TableCell className="text-text-secondary">{p.leaseAgreement.tenant.phone ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary">{p.leaseAgreement.property.unitName}</TableCell>
                  <TableCell className="font-bold text-danger">-{Number(p.amount).toLocaleString()} ETB</TableCell>
                  <TableCell className="text-text-secondary">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayment(p);
                        setDetailOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-text-primary transition-colors hover:bg-background-alt shadow-sm"
                    >
                      <Eye size={13} className="text-primary" />
                      <span>{isAmharic ? "ዝርዝር" : "Detail"}</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {detailOpen && selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface p-5 shadow-modal animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-primary/90 to-sidebar shadow-glow-gold">
                  <EthiopicCross size={20} variant="gold" />
                </div>
                <div>
                  <h3 className="text-[16.5px] font-semibold text-text-primary">{isAmharic ? "ያለፈበት የኪራይ እዳ ዝርዝር" : "Overdue Rental Notice"}</h3>
                  <p className="text-[12.5px] text-text-secondary">{selectedPayment.leaseAgreement.tenant.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-background-alt"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የተከራየው ቤት" : "Property Unit"}</span>
                <span className="font-semibold text-text-primary">{selectedPayment.leaseAgreement.property.unitName}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ተከራይ ስልክ" : "Tenant Phone"}</span>
                <span className="font-medium text-text-primary">{selectedPayment.leaseAgreement.tenant.phone ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ያልተከፈለ እዳ መጠን" : "Overdue Amount"}</span>
                <span className="font-bold text-danger text-[16px]">-{Number(selectedPayment.amount).toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ያለፈበት ቀን" : "Overdue Since"}</span>
                <span className="font-medium text-text-primary">{new Date(selectedPayment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button variant="secondary" onClick={() => setDetailOpen(false)} icon={<ArrowLeft size={16} />}>
                {isAmharic ? "ተመለስ (Back)" : "Back to Table"}
              </Button>
              <Button onClick={() => setDetailOpen(false)}>
                {isAmharic ? "እሺ" : "Done"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
