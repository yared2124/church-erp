"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, Eye } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { paymentMethodLabel, type ApiTransaction, type TransactionStatus, type TransactionType } from "@/features/finance/finance.types";
import { TransactionDetailDialog } from "./transaction-detail-dialog";

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
  const [selected, setSelected] = React.useState<ApiTransaction | null>(null);
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
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                {!fixedType && <TableHead className="whitespace-nowrap">Type</TableHead>}
                <TableHead className="whitespace-nowrap">Description</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Amount (ETB)</TableHead>
                <TableHead className="whitespace-nowrap">Method</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                {!compact && <TableHead className="whitespace-nowrap">Created By</TableHead>}
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {display.map((t) => (
                <TableRow
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="cursor-pointer transition-colors hover:bg-background-alt/60"
                >
                  <TableCell className="font-medium text-text-secondary whitespace-nowrap">{t.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{formatDate(t.transactionDate)}</TableCell>
                  {!fixedType && (
                    <TableCell className="whitespace-nowrap">
                      <TypeIcon type={t.type} />
                    </TableCell>
                  )}
                  <TableCell className="font-semibold text-text-primary whitespace-nowrap">{t.description}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{t.category.name}</TableCell>
                  <TableCell className={`whitespace-nowrap ${t.type === "Income" ? "font-semibold text-success" : "font-semibold text-danger"}`}>
                    {t.type === "Income" ? "+" : "-"}
                    {Number(t.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{paymentMethodLabel(t.paymentMethod)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge tone={statusTone[t.status]}>{t.status}</Badge>
                  </TableCell>
                  {!compact && <TableCell className="text-text-secondary whitespace-nowrap">{t.createdBy.name}</TableCell>}
                  <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="የዝውውር ዝርዝር መረጃ እይ / View Transaction Detail"
                        onClick={() => setSelected(t)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-[12px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt hover:border-primary/40"
                      >
                        <Eye size={13} className="text-primary" />
                        <span className="hidden sm:inline">ዝርዝር</span>
                      </button>
                      <button
                        aria-label={`More actions for ${t.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
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

          {/* Pop-up Modal Dialog with Back Button */}
          <TransactionDetailDialog
            transaction={selected}
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
