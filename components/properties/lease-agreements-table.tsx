"use client";

import * as React from "react";
import { Eye, FileText, Calendar, X, ArrowLeft } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number | string;
  status: "Active" | "Expired" | "Terminated";
  tenant: { name: string; phone: string | null };
  property: { unitName: string; type: string };
}

export function LeaseAgreementsTable({ leases }: { leases: Lease[] }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedLease, setSelectedLease] = React.useState<Lease | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return leases.filter((l) => {
      const matchSearch = l.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        l.property.unitName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leases, search, statusFilter]);

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
              { value: "Active", label: isAmharic ? "ንቁ ውል" : "Active" },
              { value: "Expired", label: isAmharic ? "ያለቀበት" : "Expired" },
              { value: "Terminated", label: isAmharic ? "የተቋረጠ" : "Terminated" },
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
              <TableHead>{isAmharic ? "ወርሃዊ ኪራይ" : "Monthly Rent"}</TableHead>
              <TableHead>{isAmharic ? "የመጀመሪያ ቀን" : "Start Date"}</TableHead>
              <TableHead>{isAmharic ? "የማብቂያ ቀን" : "End Date"}</TableHead>
              <TableHead>{isAmharic ? "ሁኔታ" : "Status"}</TableHead>
              <TableHead className="text-right">{isAmharic ? "ተግባር" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-text-muted">
                  {isAmharic ? "ምንም የውል ስምምነት አልተገኘም።" : "No lease agreements found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow
                  key={l.id}
                  onClick={() => {
                    setSelectedLease(l);
                    setDetailOpen(true);
                  }}
                  className="cursor-pointer transition-colors hover:bg-background-alt/60"
                >
                  <TableCell className="font-semibold text-text-primary">{l.tenant.name}</TableCell>
                  <TableCell className="text-text-secondary">{l.property.unitName}</TableCell>
                  <TableCell className="font-bold text-success">{Number(l.monthlyRent).toLocaleString()} ETB</TableCell>
                  <TableCell className="text-text-secondary">{new Date(l.startDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-text-secondary">{new Date(l.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge tone={l.status === "Active" ? "success" : l.status === "Expired" ? "warning" : "danger"}>
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLease(l);
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

      {detailOpen && selectedLease && (
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
                  <h3 className="text-[16.5px] font-semibold text-text-primary">{isAmharic ? "የኪራይ ውል ስምምነት ዝርዝር" : "Lease Agreement Detail"}</h3>
                  <p className="text-[12.5px] text-text-secondary">{selectedLease.tenant.name}</p>
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
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የተከራየው ክፍል" : "Unit"}</span>
                <span className="font-semibold text-text-primary">{selectedLease.property.unitName} ({selectedLease.property.type})</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ወርሃዊ ኪራይ" : "Monthly Rent"}</span>
                <span className="font-bold text-success text-[15px]">{Number(selectedLease.monthlyRent).toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የውል ዘመን" : "Lease Period"}</span>
                <span className="font-medium text-text-primary">
                  {new Date(selectedLease.startDate).toLocaleDateString()} - {new Date(selectedLease.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የውል ሁኔታ" : "Status"}</span>
                <Badge tone={selectedLease.status === "Active" ? "success" : "warning"}>{selectedLease.status}</Badge>
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
