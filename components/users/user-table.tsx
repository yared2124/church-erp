"use client";

import * as React from "react";
import { Eye, Pencil, MoreVertical } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";

type UserStatus = "Active" | "Inactive" | "Locked";

export interface ApiSystemUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  roles: { role: { id: string; name: string } }[];
}

const statusTone: Record<UserStatus, BadgeTone> = { Active: "success", Inactive: "neutral", Locked: "danger" };

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" });
}

interface UserTableProps {
  selectedId: string | null;
  onSelect: (u: ApiSystemUser) => void;
  roleOptions: string[];
}

export function UserTable({ selectedId, onSelect, roleOptions }: UserTableProps) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [result, setResult] = React.useState<Paginated<ApiSystemUser> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, role, status, pageSize]);

  const fetchUsers = React.useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (role !== "all") params.set("role", role);
    if (status !== "all") params.set("status", status);

    apiFetch<Paginated<ApiSystemUser>>(`/api/users?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load users."))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, role, status]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const clearFilters = () => {
    setSearchInput("");
    setRole("all");
    setStatus("all");
  };

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search users by name or email..."
        filters={[
          { key: "role", value: role, onChange: setRole, options: [{ value: "all", label: "All Roles" }, ...roleOptions.map((r) => ({ value: r, label: r }))] },
          { key: "status", value: status, onChange: setStatus, options: [
            { value: "all", label: "All Statuses" },
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
            { value: "Locked", label: "Locked" },
          ] },
        ]}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState description={error} onRetry={fetchUsers} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 6 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No users found" description="There are no users matching your current filters." actionLabel="Clear Filters" onAction={clearFilters} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((u) => (
                <TableRow key={u.id} selected={u.id === selectedId} onClick={() => onSelect(u)} className="cursor-pointer">
                  <TableCell>
                    <p className="font-semibold text-text-primary">{u.name}</p>
                    <p className="text-[11.5px] text-text-muted">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    {u.roles.map((r) => <Badge key={r.role.id} tone="info">{r.role.name}</Badge>)}
                  </TableCell>
                  <TableCell><Badge tone={statusTone[u.status]}>{u.status}</Badge></TableCell>
                  <TableCell className="text-text-secondary">{formatDateTime(u.lastLoginAt)}</TableCell>
                  <TableCell className="text-text-secondary">{formatDateTime(u.createdAt)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onSelect(u)} aria-label={`View ${u.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt"><Eye size={16} /></button>
                      <button aria-label={`Edit ${u.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt"><Pencil size={16} /></button>
                      <button aria-label={`More actions for ${u.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt"><MoreVertical size={16} /></button>
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
