"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/input";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { headOfFamily, memberFullName, type ApiFamily, type SebekaStatus } from "@/features/families/family.types";

const sebekaTone: Record<SebekaStatus, BadgeTone> = {
  Paid: "success",
  Partial: "warning",
  Unpaid: "neutral",
  Overdue: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface FamilyTableProps {
  selectedId: string | null;
  onSelect: (family: ApiFamily) => void;
  refreshKey?: number;
}

export function FamilyTable({ selectedId, onSelect, refreshKey = 0 }: FamilyTableProps) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [sebeka, setSebeka] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [result, setResult] = React.useState<Paginated<ApiFamily> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, status, sebeka, pageSize]);

  const fetchFamilies = React.useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (sebeka !== "all") params.set("sebekaStatus", sebeka);

    apiFetch<Paginated<ApiFamily>>(`/api/families?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load families."))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, status, sebeka]);

  React.useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies, refreshKey]);

  const clearFilters = () => {
    setSearchInput("");
    setStatus("all");
    setSebeka("all");
  };

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search families..."
        filters={[
          {
            key: "status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "All Status" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ],
          },
          {
            key: "sebeka",
            value: sebeka,
            onChange: setSebeka,
            options: [
              { value: "all", label: "All Sebeka Status" },
              { value: "Paid", label: "Paid" },
              { value: "Partial", label: "Partial" },
              { value: "Unpaid", label: "Unpaid" },
              { value: "Overdue", label: "Overdue" },
            ],
          },
        ]}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState description={error} onRetry={fetchFamilies} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState
          title="No families found"
          description="There are no families matching your current filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox aria-label="Select all" /></TableHead>
                <TableHead>Family ID</TableHead>
                <TableHead>Family Name</TableHead>
                <TableHead>Head of Family</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Sebeka Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((f) => {
                const head = headOfFamily(f);
                return (
                  <TableRow key={f.id} selected={f.id === selectedId} onClick={() => onSelect(f)} className="cursor-pointer">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={`Select ${f.name}`} />
                    </TableCell>
                    <TableCell className="font-medium text-text-secondary">{f.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-semibold text-text-primary">{f.name}</TableCell>
                    <TableCell className="text-text-secondary">{head ? memberFullName(head) : "—"}</TableCell>
                    <TableCell className="text-text-secondary">{f._count.members}</TableCell>
                    <TableCell className="text-text-secondary">{f.phone ?? "—"}</TableCell>
                    <TableCell><Badge tone={sebekaTone[f.sebekaStatus]}>{f.sebekaStatus}</Badge></TableCell>
                    <TableCell><Badge tone={f.status === "Active" ? "success" : "neutral"}>{f.status}</Badge></TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button aria-label={`More actions for ${f.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                        <MoreHorizontal size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
