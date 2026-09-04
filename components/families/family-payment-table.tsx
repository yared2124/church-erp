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
import { paymentMethodLabel, type ApiFamilyPayment, type PaymentStatus } from "@/features/family-payments/family-payment.types";

const statusTone: Record<PaymentStatus, BadgeTone> = {
  Paid: "success",
  Partial: "warning",
  Unpaid: "neutral",
  Overdue: "danger",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function FamilyPaymentTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [year, setYear] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [method, setMethod] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [result, setResult] = React.useState<Paginated<ApiFamilyPayment> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, year, status, method, pageSize]);

  const fetchPayments = React.useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (year !== "all") params.set("year", year);
    if (status !== "all") params.set("status", status);
    if (method !== "all") params.set("paymentMethod", method);

    apiFetch<Paginated<ApiFamilyPayment>>(`/api/family-payments?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load payments."))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, year, status, method]);

  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments, refreshKey]);

  const clearFilters = () => {
    setSearchInput("");
    setYear("all");
    setStatus("all");
    setMethod("all");
  };

  const years = React.useMemo(() => {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search family or head of family..."
        filters={[
          {
            key: "year",
            value: year,
            onChange: setYear,
            options: [{ value: "all", label: "All Years" }, ...years.map((y) => ({ value: String(y), label: String(y) }))],
          },
          {
            key: "status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "All Status" },
              { value: "Paid", label: "Paid" },
              { value: "Partial", label: "Partial" },
              { value: "Unpaid", label: "Unpaid" },
              { value: "Overdue", label: "Overdue" },
            ],
          },
          {
            key: "method",
            value: method,
            onChange: setMethod,
            options: [
              { value: "all", label: "All Methods" },
              { value: "Cash", label: "Cash" },
              { value: "BankTransfer", label: "Bank Transfer" },
              { value: "MobileMoney", label: "Mobile Money" },
            ],
          },
        ]}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState description={error} onRetry={fetchPayments} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="There are no Sebeka payments matching your current filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No.</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((p) => {
                const expected = Number(p.expectedAmount);
                const paid = Number(p.paidAmount);
                const balance = expected - paid;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-text-secondary">{p.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-semibold text-text-primary">{p.family.name}</TableCell>
                    <TableCell className="text-text-secondary">{p.year}</TableCell>
                    <TableCell className="text-text-secondary">{expected.toLocaleString()} ETB</TableCell>
                    <TableCell className="text-text-secondary">{paid.toLocaleString()} ETB</TableCell>
                    <TableCell className={balance > 0 ? "font-medium text-danger" : "text-text-secondary"}>
                      {balance.toLocaleString()} ETB
                    </TableCell>
                    <TableCell className="text-text-secondary">{formatDate(p.paymentDate)}</TableCell>
                    <TableCell className="text-text-secondary">{paymentMethodLabel(p.paymentMethod)}</TableCell>
                    <TableCell><Badge tone={statusTone[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <button aria-label={`More actions for receipt ${p.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
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
