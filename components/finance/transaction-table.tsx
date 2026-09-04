"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { paymentMethodLabel, type ApiTransaction, type TransactionStatus, type TransactionType } from "@/features/finance/finance.types";

const statusTone: Record<TransactionStatus, BadgeTone> = {
  Paid: "success",
  Pending: "warning",
  Approved: "info",
  Rejected: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface TransactionTableProps {
  fixedType?: TransactionType;
  limit?: number;
  compact?: boolean;
}

export function TransactionTable({ fixedType, limit, compact = false }: TransactionTableProps) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(limit ?? 10);

  const [result, setResult] = React.useState<Paginated<ApiTransaction> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, status, pageSize]);

  const fetchTransactions = React.useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (fixedType) params.set("type", fixedType);
    if (status !== "all") params.set("status", status);

    apiFetch<Paginated<ApiTransaction>>(`/api/finance/transactions?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load transactions."))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, status, fixedType]);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const clearFilters = () => {
    setSearchInput("");
    setStatus("all");
  };

  const display = result?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      {!compact && (
        <DataToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search transactions..."
          filters={[
            {
              key: "status",
              value: status,
              onChange: setStatus,
              options: [
                { value: "all", label: "All Status" },
                { value: "Paid", label: "Paid" },
                { value: "Pending", label: "Pending" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ],
            },
          ]}
          onClearFilters={clearFilters}
        />
      )}

      {error ? (
        <ErrorState description={error} onRetry={fetchTransactions} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: compact ? 3 : 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : display.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="There are no transactions matching your current filters."
          actionLabel={compact ? undefined : "Clear Filters"}
          onAction={compact ? undefined : clearFilters}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                {!fixedType && <TableHead>Type</TableHead>}
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount (ETB)</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                {!compact && <TableHead>Created By</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {display.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-text-secondary">{t.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-text-secondary">{formatDate(t.transactionDate)}</TableCell>
                  {!fixedType && (
                    <TableCell>
                      <TypeIcon type={t.type} />
                    </TableCell>
                  )}
                  <TableCell className="font-semibold text-text-primary">{t.description}</TableCell>
                  <TableCell className="text-text-secondary">{t.category.name}</TableCell>
                  <TableCell className={t.type === "Income" ? "font-semibold text-success" : "font-semibold text-danger"}>
                    {t.type === "Income" ? "+" : "-"}
                    {Number(t.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-text-secondary">{paymentMethodLabel(t.paymentMethod)}</TableCell>
                  <TableCell>
                    <Badge tone={statusTone[t.status]}>{t.status}</Badge>
                  </TableCell>
                  {!compact && <TableCell className="text-text-secondary">{t.createdBy.name}</TableCell>}
                  <TableCell className="text-right">
                    <button
                      aria-label={`More actions for ${t.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!compact && result && (
            <Pagination
              page={result.pagination.page}
              pageCount={result.pagination.totalPages}
              pageSize={result.pagination.limit}
              totalItems={result.pagination.total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      )}
    </div>
  );
}

function TypeIcon({ type }: { type: TransactionType }) {
  const isIncome = type === "Income";
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
        isIncome ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
      }`}
    >
      {isIncome ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
    </span>
  );
}
