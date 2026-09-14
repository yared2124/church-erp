"use client";

import * as React from "react";
import { Eye, Users, Phone, Mail, Home, X, ArrowLeft } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

interface Tenant {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  leaseAgreements: {
    id: string;
    status: string;
    monthlyRent: number | string;
    property: { unitName: string; type: string };
  }[];
}

export function TenantsTable({ tenants }: { tenants: Tenant[] }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [search, setSearch] = React.useState("");
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.phone?.includes(search) ?? false) ||
        (t.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchSearch;
    });
  }, [tenants, search]);

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isAmharic ? "የተከራዩን ስም ወይም ስልክ ፈልግ..." : "Search tenant name or phone..."}
        onClearFilters={() => setSearch("")}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isAmharic ? "የተከራይ ስም" : "Tenant Name"}</TableHead>
              <TableHead>{isAmharic ? "ስልክ" : "Phone"}</TableHead>
              <TableHead>{isAmharic ? "ኢሜይል" : "Email"}</TableHead>
              <TableHead>{isAmharic ? "የተከራዩት ቤት" : "Leased Unit"}</TableHead>
              <TableHead>{isAmharic ? "የውል ሁኔታ" : "Lease Status"}</TableHead>
              <TableHead className="text-right">{isAmharic ? "ተግባር" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-text-muted">
                  {isAmharic ? "ምንም ተከራይ አልተገኘም።" : "No tenants found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => {
                const activeLease = t.leaseAgreements.find((l) => l.status === "Active") || t.leaseAgreements[0];
                return (
                  <TableRow
                    key={t.id}
                    onClick={() => {
                      setSelectedTenant(t);
                      setDetailOpen(true);
                    }}
                    className="cursor-pointer transition-colors hover:bg-background-alt/60"
                  >
                    <TableCell className="font-semibold text-text-primary">{t.name}</TableCell>
                    <TableCell className="text-text-secondary">{t.phone ?? "—"}</TableCell>
                    <TableCell className="text-text-secondary">{t.email ?? "—"}</TableCell>
                    <TableCell className="text-text-secondary">
                      {activeLease ? (
                        <div className="flex items-center gap-1.5 font-medium text-text-primary">
                          <Home size={13} className="text-gold" />
                          <span>{activeLease.property.unitName}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {activeLease ? (
                        <Badge tone={activeLease.status === "Active" ? "success" : "warning"}>
                          {activeLease.status}
                        </Badge>
                      ) : (
                        <Badge tone="neutral">{isAmharic ? "ያለ ውል" : "None"}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenant(t);
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

      {/* Tenant Detail Modal */}
      {detailOpen && selectedTenant && (
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
                  <h3 className="text-[16.5px] font-semibold text-text-primary">{selectedTenant.name}</h3>
                  <p className="text-[12.5px] text-text-secondary">{isAmharic ? "የቤተክርስቲያን ተከራይ" : "Church Property Tenant"}</p>
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
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ስልክ ቁጥር" : "Phone"}</span>
                <span className="font-medium text-text-primary">{selectedTenant.phone ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "ኢሜይል" : "Email"}</span>
                <span className="font-medium text-text-primary">{selectedTenant.email ?? "—"}</span>
              </div>
              <div className="rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[12px] font-semibold text-text-muted uppercase">{isAmharic ? "የተከራዩዋቸው ክፍሎች / ቤቶች" : "Leased Properties"}</span>
                <div className="mt-2 space-y-2">
                  {selectedTenant.leaseAgreements.length === 0 ? (
                    <p className="text-[13px] text-text-muted">{isAmharic ? "ምንም ንቁ የውል ስምምነት የለም።" : "No lease agreements."}</p>
                  ) : (
                    selectedTenant.leaseAgreements.map((l) => (
                      <div key={l.id} className="flex items-center justify-between border-t border-border-light pt-2">
                        <span className="font-medium text-text-primary text-[13px]">{l.property.unitName} ({l.property.type})</span>
                        <span className="font-bold text-success text-[13px]">{Number(l.monthlyRent).toLocaleString()} ETB</span>
                      </div>
                    ))
                  )}
                </div>
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
