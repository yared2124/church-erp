"use client";

import * as React from "react";
import { Eye, MoreVertical } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";

type CertificateStatus = "Pending" | "Approved" | "Rejected" | "Issued";
type CertificateType = "Baptism" | "Marriage" | "Burial";

export interface ApiCertificateRequest {
  id: string;
  type: CertificateType;
  status: CertificateStatus;
  purpose: string | null;
  notes: string | null;
  createdAt: string;
  member: { id: string; firstName: string; lastName: string; dateOfBirth: string; baptizedDate: string | null };
  requestedBy: { id: string; name: string };
}

const statusTone: Record<CertificateStatus, BadgeTone> = { Pending: "warning", Approved: "success", Rejected: "danger", Issued: "info" };
const typeLabel: Record<CertificateType, string> = { Baptism: "Baptism Certificate", Marriage: "Marriage Certificate", Burial: "Burial Certificate" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface CertificateTableProps {
  selectedId: string | null;
  onSelect: (r: ApiCertificateRequest) => void;
}

export function CertificateTable({ selectedId, onSelect }: CertificateTableProps) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [result, setResult] = React.useState<Paginated<ApiCertificateRequest> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, type, status, pageSize]);

  const fetchRequests = React.useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (type !== "all") params.set("type", type);
    if (status !== "all") params.set("status", status);

    apiFetch<Paginated<ApiCertificateRequest>>(`/api/certificates?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load requests."))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, type, status]);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const clearFilters = () => {
    setSearchInput("");
    setType("all");
    setStatus("all");
  };

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search by member name..."
        filters={[
          { key: "type", value: type, onChange: setType, options: [
            { value: "all", label: "All Types" },
            { value: "Baptism", label: "Baptism Certificate" },
            { value: "Marriage", label: "Marriage Certificate" },
            { value: "Burial", label: "Burial Certificate" },
          ] },
          { key: "status", value: status, onChange: setStatus, options: [
            { value: "all", label: "All Status" },
            { value: "Pending", label: "Pending" },
            { value: "Approved", label: "Approved" },
            { value: "Rejected", label: "Rejected" },
            { value: "Issued", label: "Issued" },
          ] },
        ]}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState description={error} onRetry={fetchRequests} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No requests found" description="There are no certificate requests matching your current filters." actionLabel="Clear Filters" onAction={clearFilters} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Certificate Type</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((r) => (
                <TableRow key={r.id} selected={r.id === selectedId} onClick={() => onSelect(r)} className="cursor-pointer">
                  <TableCell className="font-medium text-text-secondary">{r.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <p className="font-semibold text-text-primary">{r.member.firstName} {r.member.lastName}</p>
                  </TableCell>
                  <TableCell className="text-text-secondary">{typeLabel[r.type]}</TableCell>
                  <TableCell className="text-text-primary">{r.requestedBy.name}</TableCell>
                  <TableCell className="text-text-secondary">{formatDate(r.createdAt)}</TableCell>
                  <TableCell><Badge tone={statusTone[r.status]}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onSelect(r)} aria-label={`View ${r.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                        <Eye size={16} />
                      </button>
                      <button aria-label={`More actions for ${r.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination page={result.pagination.page} pageCount={result.pagination.totalPages} pageSize={result.pagination.limit} totalItems={result.pagination.total} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  );
}
