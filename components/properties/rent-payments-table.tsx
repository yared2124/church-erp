"use client";

import * as React from "react";
import { Eye, Wallet, Calendar, X, ArrowLeft } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

interface RentPayment {
  id: string;
  amount: number | string;
  paymentDate: string | null;
  paymentMethod: string | null;
  status: "Paid" | "Pending" | "Overdue";
  createdAt: string;
  leaseAgreement: {
    tenant: { name: string; phone: string | null };
    property: { unitName: string };
  };
}

export function RentPaymentsTable({ payments }: { payments: RentPayment[] }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedPayment, setSelectedPayment] = React.useState<RentPayment | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return payments.filter((p) => {
      const matchSearch = p.leaseAgreement.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        p.leaseAgreement.property.unitName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [payments, search, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isAmharic ? "በተከራይ ወይም በቤት ስም ፈልግ..." : "Search tenant or unit name..."}
        filters={[
          {
            key: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: isAmharic ? "ሁሉም ሁኔታዎች" : "All Status" },
              { value: "Paid", label: isAmharic ? "የተከፈለ" : "Paid" },
              { value: "Pending", label: isAmharic ? "በሂደት ላይ" : "Pending" },
              { value: "Overdue", label: isAmharic ? "ያለፈበት" : "Overdue" },
            ],
          },
        ]}
        onClearFilters={() => {
          setSearch("");
          setStatusFilter("all");
        }}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isAmharic ? "ተከራይ" : "Tenant"}</TableHead>
              <TableHead>{isAmharic ? "የተከራየው ቤት" : "Property Unit"}</TableHead>
              <TableHead>{isAmharic ? "የክፍያ መጠን" : "Amount"}</TableHead>
              <TableHead>{isAmharic ? "የተከፈለበት ቀን" : "Payment Date"}</TableHead>
              <TableHead>{isAmharic ? "ዘዴ" : "Method"}</TableHead>
              <TableHead>{isAmharic ? "ሁኔታ" : "Status"}</TableHead>
              <TableHead className="text-right">{isAmharic ? "ተግባር" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-text-muted">
                  {isAmharic ? "ምንም የኪራይ ክፍያ አልተገኘም።" : "No rent payments found."}
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
                  <TableCell className="text-text-secondary">{p.leaseAgreement.property.unitName}</TableCell>
                  <TableCell className="font-bold text-success">+{Number(p.amount).toLocaleString()} ETB</TableCell>
                  <TableCell className="text-text-secondary">
                    {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">{p.paymentMethod ?? "Cash"}</TableCell>
                  <TableCell>
                    <Badge tone={p.status === "Paid" ? "success" : p.status === "Pending" ? "warning" : "danger"}>
                      {p.status}
                    </Badge>
                  </TableCell>
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
                  <h3 className="text-[16.5px] font-semibold text-text-primary">{isAmharic ? "የኪራይ ክፍያ ደረሰኝ ዝርዝር" : "Rent Payment Detail"}</h3>
                  <p className="text-[12.5px] text-text-secondary">{selectedPayment.leaseAgreement.property.unitName}</p>
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
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ተከራይ" : "Tenant"}</span>
                <span className="font-semibold text-text-primary">{selectedPayment.leaseAgreement.tenant.name}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የተከፈለ መጠን" : "Amount Paid"}</span>
                <span className="font-bold text-success text-[15px]">{Number(selectedPayment.amount).toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የክፍያ ቀን" : "Date"}</span>
                <span className="font-medium text-text-primary">
                  {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የክፍያ ሁኔታ" : "Status"}</span>
                <Badge tone={selectedPayment.status === "Paid" ? "success" : "danger"}>{selectedPayment.status}</Badge>
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
