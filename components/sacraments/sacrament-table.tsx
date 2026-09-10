"use client";

import * as React from "react";
import { MoreHorizontal, Eye } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { memberName, type ApiSacrament, type SacramentStatus, type SacramentType } from "@/features/sacraments/sacrament.types";

const statusTone: Record<SacramentStatus, BadgeTone> = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface SacramentTableProps {
  type: SacramentType;
  selectedId: string | null;
  onSelect: (record: ApiSacrament) => void;
  priestOptions: { id: string; name: string }[];
}

export function SacramentTable({ type, selectedId, onSelect, priestOptions }: SacramentTableProps) {
  const isMarriage = type === "Marriage";

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [priest, setPriest] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [result, setResult] = React.useState<Paginated<ApiSacrament> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, status, priest, pageSize, type]);

  const fetchRecords = React.useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ type, page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (priest !== "all") params.set("priestId", priest);

    apiFetch<Paginated<ApiSacrament>>(`/api/sacraments?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load records."))
      .finally(() => setLoading(false));
  }, [type, page, pageSize, search, status, priest]);

  React.useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const clearFilters = () => {
    setSearchInput("");
    setStatus("all");
    setPriest("all");
  };

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={`Search ${type.toLowerCase()}s...`}
        filters={[
          {
            key: "status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "All Status" },
              { value: "Approved", label: "Approved" },
              { value: "Pending", label: "Pending" },
              { value: "Rejected", label: "Rejected" },
            ],
          },
          {
            key: "priest",
            value: priest,
            onChange: setPriest,
            options: [{ value: "all", label: "All Priests" }, ...priestOptions.map((p) => ({ value: p.id, label: p.name }))],
          },
        ]}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState description={error} onRetry={fetchRecords} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState
          title={`No ${type.toLowerCase()} records found`}
          description="There are no records matching your current filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">{isMarriage ? "Groom" : type === "Burial" ? "Deceased" : "Child Name"}</TableHead>
                {isMarriage && <TableHead className="whitespace-nowrap">Bride</TableHead>}
                {!isMarriage && <TableHead className="whitespace-nowrap">Gender</TableHead>}
                <TableHead className="whitespace-nowrap">Family</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Priest</TableHead>
                <TableHead className="whitespace-nowrap">Church</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((r) => (
                <TableRow
                  key={r.id}
                  selected={r.id === selectedId}
                  onClick={() => onSelect(r)}
                  className="cursor-pointer transition-colors hover:bg-background-alt/60"
                >
                  <TableCell className="font-medium text-text-secondary whitespace-nowrap">{r.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-semibold text-text-primary whitespace-nowrap">{memberName(r.primaryMember)}</TableCell>
                  {isMarriage && (
                    <TableCell className="font-semibold text-text-primary whitespace-nowrap">
                      {r.secondaryMember ? memberName(r.secondaryMember) : "—"}
                    </TableCell>
                  )}
                  {!isMarriage && <TableCell className="text-text-secondary whitespace-nowrap">{r.primaryMember.gender}</TableCell>}
                  <TableCell className="text-text-secondary whitespace-nowrap">{r.family?.name ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{formatDate(r.date)}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{r.priest?.name ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{r.church}</TableCell>
                  <TableCell className="whitespace-nowrap"><Badge tone={statusTone[r.status]}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="የምስጢራት ዝርዝር መረጃ እይ / View Sacrament Detail"
                        onClick={() => onSelect(r)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-[12px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt hover:border-primary/40"
                      >
                        <Eye size={13} className="text-primary" />
                        <span className="hidden sm:inline">ዝርዝር</span>
                      </button>
                      <button aria-label={`More actions for ${r.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            page={result.pagination.page}
            pageCount={result.pagination.totalPages}
            pageSize={result.pagination.limit}
            totalItems={result.pagination.total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
