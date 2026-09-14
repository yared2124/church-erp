"use client";

import * as React from "react";
import { Eye, Building2, Home, X, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

interface House {
  id: string;
  unitName: string;
  type: string;
  monthlyRent: number | string;
  status: "Occupied" | "Vacant";
  leaseAgreements?: {
    id: string;
    tenant: { name: string; phone: string | null };
  }[];
}

export function HousesTable({ properties }: { properties: House[] }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedHouse, setSelectedHouse] = React.useState<House | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch = p.unitName.toLowerCase().includes(search.toLowerCase()) ||
        p.type.toLowerCase().includes(search.toLowerCase()) ||
        (p.leaseAgreements?.[0]?.tenant?.name?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [properties, search, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isAmharic ? "የቤቱን ስም ወይም ተከራይ ፈልግ..." : "Search unit name or tenant..."}
        filters={[
          {
            key: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: isAmharic ? "ሁሉም ሁኔታዎች" : "All Status" },
              { value: "Occupied", label: isAmharic ? "የተከራየ (Occupied)" : "Occupied" },
              { value: "Vacant", label: isAmharic ? "ክፍት (Vacant)" : "Vacant" },
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
              <TableHead>{isAmharic ? "የቤቱ / ክፍል ስም" : "Unit Name"}</TableHead>
              <TableHead>{isAmharic ? "ዓይነት" : "Type"}</TableHead>
              <TableHead>{isAmharic ? "ወርሃዊ ኪራይ" : "Monthly Rent"}</TableHead>
              <TableHead>{isAmharic ? "ወቅታዊ ተከራይ" : "Current Tenant"}</TableHead>
              <TableHead>{isAmharic ? "ሁኔታ" : "Status"}</TableHead>
              <TableHead className="text-right">{isAmharic ? "ተግባር" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-text-muted">
                  {isAmharic ? "ምንም መረጃ አልተገኘም።" : "No properties found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const tenant = p.leaseAgreements?.[0]?.tenant;
                return (
                  <TableRow
                    key={p.id}
                    onClick={() => {
                      setSelectedHouse(p);
                      setDetailOpen(true);
                    }}
                    className="cursor-pointer transition-colors hover:bg-background-alt/60"
                  >
                    <TableCell className="font-semibold text-text-primary">
                      <div className="flex items-center gap-2">
                        <Home size={15} className="text-gold" />
                        <span>{p.unitName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{p.type}</TableCell>
                    <TableCell className="font-medium text-text-primary">
                      {Number(p.monthlyRent).toLocaleString()} ETB
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {tenant ? tenant.name : isAmharic ? "— (ክፍት)" : "— (Vacant)"}
                    </TableCell>
                    <TableCell>
                      <Badge tone={p.status === "Occupied" ? "success" : "neutral"}>
                        {p.status === "Occupied" ? (isAmharic ? "የተከራየ" : "Occupied") : (isAmharic ? "ክፍት" : "Vacant")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHouse(p);
                          setDetailOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-text-primary transition-colors hover:bg-background-alt shadow-sm"
                      >
                        <Eye size={13} className="text-primary" />
                        <span>{isAmharic ? "ዝርዝር" : "Detail"}</span>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* House Detail Dialog with Back Button */}
      {detailOpen && selectedHouse && (
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
                  <h3 className="text-[16.5px] font-semibold text-text-primary">{selectedHouse.unitName}</h3>
                  <p className="text-[12.5px] text-text-secondary">{selectedHouse.type}</p>
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

            <div className="my-5 space-y-3.5">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ሁኔታ" : "Status"}</span>
                <Badge tone={selectedHouse.status === "Occupied" ? "success" : "neutral"}>
                  {selectedHouse.status === "Occupied" ? (isAmharic ? "የተከራየ" : "Occupied") : (isAmharic ? "ክፍት" : "Vacant")}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ወርሃዊ ኪራይ" : "Monthly Rent"}</span>
                <span className="font-bold text-success">{Number(selectedHouse.monthlyRent).toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ወቅታዊ ተከራይ" : "Active Tenant"}</span>
                <span className="font-medium text-text-primary">
                  {selectedHouse.leaseAgreements?.[0]?.tenant?.name ?? (isAmharic ? "የለም (ክፍት ቤት)" : "None (Vacant)")}
                </span>
              </div>
              {selectedHouse.leaseAgreements?.[0]?.tenant?.phone && (
                <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                  <span className="text-[13px] text-text-secondary">{isAmharic ? "የተከራይ ስልክ" : "Tenant Phone"}</span>
                  <span className="font-medium text-text-primary">{selectedHouse.leaseAgreements[0].tenant.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="secondary"
                onClick={() => setDetailOpen(false)}
                icon={<ArrowLeft size={16} />}
              >
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
