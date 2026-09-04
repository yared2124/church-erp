"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Checkbox, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";

type AuditStatus = "Success" | "Failed";

export interface ApiAuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  status: AuditStatus;
  ipAddress: string | null;
  userAgent: string | null;
  description: string | null;
  changes: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string };
}

const statusTone: Record<AuditStatus, BadgeTone> = { Success: "success", Failed: "danger" };
const actionTone: Record<string, BadgeTone> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "danger",
  APPROVE: "warning",
  LOGIN: "neutral",
  IMPORT: "info",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
}

interface AuditLogTableProps {
  selectedId: string | null;
  onSelect: (log: ApiAuditLog) => void;
  filterOptions: { users: { id: string; name: string }[]; actions: string[]; entities: string[] };
}

export function AuditLogTable({ selectedId, onSelect, filterOptions }: AuditLogTableProps) {
  const [user, setUser] = React.useState("all");
  const [action, setAction] = React.useState("all");
  const [entity, setEntity] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [result, setResult] = React.useState<Paginated<ApiAuditLog> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => setPage(1), [user, action, entity, status, pageSize]);

  const fetchLogs = React.useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (user !== "all") params.set("userId", user);
    if (action !== "all") params.set("action", action);
    if (entity !== "all") params.set("entity", entity);
    if (status !== "all") params.set("status", status);

    apiFetch<Paginated<ApiAuditLog>>(`/api/audit-logs?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load audit logs."))
      .finally(() => setLoading(false));
  }, [page, pageSize, user, action, entity, status]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-[160px]">
          <Select value={user} onChange={(e) => setUser(e.target.value)} options={[{ value: "all", label: "All Users" }, ...filterOptions.users.map((u) => ({ value: u.id, label: u.name }))]} />
        </div>
        <div className="w-[160px]">
          <Select value={action} onChange={(e) => setAction(e.target.value)} options={[{ value: "all", label: "All Actions" }, ...filterOptions.actions.map((a) => ({ value: a, label: a }))]} />
        </div>
        <div className="w-[160px]">
          <Select value={entity} onChange={(e) => setEntity(e.target.value)} options={[{ value: "all", label: "All Entities" }, ...filterOptions.entities.map((e) => ({ value: e, label: e }))]} />
        </div>
        <div className="w-[150px]">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "all", label: "All Status" }, { value: "Success", label: "Success" }, { value: "Failed", label: "Failed" }]} />
        </div>
      </div>

      {error ? (
        <ErrorState description={error} onRetry={fetchLogs} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 6 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No log entries found" description="There are no audit log entries matching your current filters." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox aria-label="Select all" /></TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((l) => (
                <TableRow key={l.id} selected={l.id === selectedId} onClick={() => onSelect(l)} className="cursor-pointer">
                  <TableCell onClick={(e) => e.stopPropagation()}><Checkbox aria-label={`Select ${l.id}`} /></TableCell>
                  <TableCell className="text-text-secondary">{formatDateTime(l.createdAt)}</TableCell>
                  <TableCell className="font-semibold text-text-primary">{l.user.name}</TableCell>
                  <TableCell><Badge tone={actionTone[l.action] ?? "neutral"}>{l.action}</Badge></TableCell>
                  <TableCell className="text-text-secondary">{l.entity}</TableCell>
                  <TableCell className="text-text-secondary">{l.entityId.slice(0, 8)}</TableCell>
                  <TableCell><Badge tone={statusTone[l.status]}>{l.status}</Badge></TableCell>
                  <TableCell className="text-text-secondary">{l.ipAddress ?? "—"}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onSelect(l)} aria-label={`View details for ${l.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                      <Eye size={16} />
                    </button>
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
