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

type EmployeeStatus = "Active" | "OnLeave" | "Departed";

interface ApiEmployee {
  id: string;
  fullName: string;
  department: string;
  position: string;
  phone: string | null;
  email: string | null;
  status: EmployeeStatus;
  joinDate: string;
}

const statusTone: Record<EmployeeStatus, BadgeTone> = { Active: "success", OnLeave: "warning", Departed: "neutral" };
const statusLabel: Record<EmployeeStatus, string> = { Active: "Active", OnLeave: "On Leave", Departed: "Departed" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function EmployeeTable() {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const [result, setResult] = React.useState<Paginated<ApiEmployee> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, department, status, pageSize]);

  const fetchEmployees = React.useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (department !== "all") params.set("department", department);
    if (status !== "all") params.set("status", status);

    apiFetch<Paginated<ApiEmployee>>(`/api/employees?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load employees."))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, department, status]);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const clearFilters = () => {
    setSearchInput("");
    setDepartment("all");
    setStatus("all");
  };

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search employees..."
        filters={[
          { key: "status", value: status, onChange: setStatus, options: [
            { value: "all", label: "All Status" },
            { value: "Active", label: "Active" },
            { value: "OnLeave", label: "On Leave" },
            { value: "Departed", label: "Departed" },
          ] },
        ]}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState description={error} onRetry={fetchEmployees} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No employees found" description="There are no employees matching your current filters." actionLabel="Clear Filters" onAction={clearFilters} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-semibold text-text-primary">{e.fullName}</TableCell>
                  <TableCell className="text-text-secondary">{e.department}</TableCell>
                  <TableCell className="text-text-secondary">{e.position}</TableCell>
                  <TableCell className="text-text-secondary">{e.phone ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary">{e.email ?? "—"}</TableCell>
                  <TableCell><Badge tone={statusTone[e.status]}>{statusLabel[e.status]}</Badge></TableCell>
                  <TableCell className="text-text-secondary">{formatDate(e.joinDate)}</TableCell>
                  <TableCell className="text-right">
                    <button aria-label={`More actions for ${e.fullName}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination page={result.pagination.page} pageCount={result.pagination.totalPages} pageSize={result.pagination.limit} pageSizeOptions={[5, 10, 25]} totalItems={result.pagination.total} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  );
}
