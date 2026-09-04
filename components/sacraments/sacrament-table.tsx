"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
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
                <TableHead>ID</TableHead>
                <TableHead>{isMarriage ? "Groom" : type === "Burial" ? "Deceased" : "Child Name"}</TableHead>
                {isMarriage && <TableHead>Bride</TableHead>}
                {!isMarriage && <TableHead>Gender</TableHead>}
                <TableHead>Family</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priest</TableHead>
                <TableHead>Church</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((r) => (
                <TableRow key={r.id} selected={r.id === selectedId} onClick={() => onSelect(r)} className="cursor-pointer">
                  <TableCell className="font-medium text-text-secondary">{r.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-semibold text-text-primary">{memberName(r.primaryMember)}</TableCell>
                  {isMarriage && (
                    <TableCell className="font-semibold text-text-primary">
                      {r.secondaryMember ? memberName(r.secondaryMember) : "—"}
                    </TableCell>
                  )}
                  {!isMarriage && <TableCell className="text-text-secondary">{r.primaryMember.gender}</TableCell>}
                  <TableCell className="text-text-secondary">{r.family?.name ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary">{formatDate(r.date)}</TableCell>
                  <TableCell className="text-text-secondary">{r.priest?.name ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary">{r.church}</TableCell>
                  <TableCell><Badge tone={statusTone[r.status]}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <button aria-label={`More actions for ${r.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                      <MoreHorizontal size={16} />
                    </button>
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
