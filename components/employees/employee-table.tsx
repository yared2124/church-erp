"use client";

import * as React from "react";
import { MoreHorizontal, Eye } from "lucide-react";
import { EmployeeDetailDialog } from "./employee-detail-dialog";
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
  const [selected, setSelected] = React.useState<ApiEmployee | null>(null);
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
                <TableHead className="whitespace-nowrap">Full Name</TableHead>
                <TableHead className="whitespace-nowrap">Department</TableHead>
                <TableHead className="whitespace-nowrap">Position</TableHead>
                <TableHead className="whitespace-nowrap">Phone</TableHead>
                <TableHead className="whitespace-nowrap">Email</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Join Date</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((e) => (
                <TableRow
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="cursor-pointer transition-colors hover:bg-background-alt/60"
                >
                  <TableCell className="font-semibold text-text-primary whitespace-nowrap">{e.fullName}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{e.department}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{e.position}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{e.phone ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{e.email ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap"><Badge tone={statusTone[e.status]}>{statusLabel[e.status]}</Badge></TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{formatDate(e.joinDate)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap" onClick={(ev) => ev.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="የሠራተኛውን ዝርዝር እይ / View Employee Detail"
                        onClick={() => setSelected(e)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-[12px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt hover:border-primary/40"
                      >
                        <Eye size={13} className="text-primary" />
                        <span className="hidden sm:inline">ዝርዝር</span>
                      </button>
                      <button aria-label={`More actions for ${e.fullName}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination page={result.pagination.page} pageCount={result.pagination.totalPages} pageSize={result.pagination.limit} pageSizeOptions={[5, 10, 25]} totalItems={result.pagination.total} onPageChange={setPage} onPageSizeChange={setPageSize} />

          {/* Pop-up Modal Dialog with Back Button */}
          <EmployeeDetailDialog
            employee={selected}
            open={!!selected}
            onOpenChange={(open) => {
              if (!open) setSelected(null);
            }}
          />
        </>
      )}
    </div>
  );
}
