"use client";

import * as React from "react";
import { Eye, Image as ImageIcon, Plus, CheckCircle2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { paymentMethodLabel, type ApiFamilyPayment, type PaymentStatus } from "@/features/family-payments/family-payment.types";
import { FamilyPaymentDetailDialog } from "./family-payment-detail-dialog";
import { FamilyPaymentForm, type FamilyPaymentFormValues } from "./family-payment-form";
import { useLanguage } from "@/lib/language-context";

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
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

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

  // Detail Modal state
  const [selectedPayment, setSelectedPayment] = React.useState<ApiFamilyPayment | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  // Quick Record Modal state
  const [recordModalOpen, setRecordModalOpen] = React.useState(false);
  const [recordSubmitting, setRecordSubmitting] = React.useState(false);
  const [recordError, setRecordError] = React.useState<string | null>(null);

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

  const handleRecordSubmit = async (values: FamilyPaymentFormValues) => {
    setRecordSubmitting(true);
    setRecordError(null);
    try {
      await apiFetch("/api/family-payments", {
        method: "POST",
        body: JSON.stringify({
          familyId: values.familyId,
          year: Number(values.year),
          expectedAmount: Number(values.expectedAmount),
          paidAmount: Number(values.paidAmount || 0),
          paymentDate: values.paymentDate || undefined,
          paymentMethod: values.paymentMethod || undefined,
          receiptNumber: values.receiptNumber.trim(),
          receiptUrl: values.receiptUrl || undefined,
          notes: values.notes || undefined,
        }),
      });
      setRecordModalOpen(false);
      fetchPayments();
    } catch (err) {
      setRecordError(err instanceof ApiClientError ? err.message : "Failed to save the payment.");
    } finally {
      setRecordSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1">
          <DataToolbar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder={isAmharic ? "በቤተሰብ ስም ወይም በደረሰኝ ቁጥር ፈልግ..." : "Search by family or receipt number..."}
            filters={[
              {
                key: "year",
                value: year,
                onChange: setYear,
                options: [{ value: "all", label: isAmharic ? "ሁሉም ዓመታት" : "All Years" }, ...years.map((y) => ({ value: String(y), label: String(y) }))],
              },
              {
                key: "status",
                value: status,
                onChange: setStatus,
                options: [
                  { value: "all", label: isAmharic ? "ሁሉም ሁኔታዎች" : "All Status" },
                  { value: "Paid", label: isAmharic ? "የተከፈለ" : "Paid" },
                  { value: "Partial", label: isAmharic ? "ከፊል የተከፈለ" : "Partial" },
                  { value: "Unpaid", label: isAmharic ? "ያልተከፈለ" : "Unpaid" },
                  { value: "Overdue", label: isAmharic ? "ያለፈበት" : "Overdue" },
                ],
              },
              {
                key: "method",
                value: method,
                onChange: setMethod,
                options: [
                  { value: "all", label: isAmharic ? "ሁሉም ዘዴዎች" : "All Methods" },
                  { value: "Cash", label: isAmharic ? "ጥሬ ገንዘብ (ደረሰኝ)" : "Cash (Paper Receipt)" },
                  { value: "BankTransfer", label: isAmharic ? "በባንክ የተከፈለ" : "Bank Transfer" },
                ],
              },
            ]}
            onClearFilters={clearFilters}
          />
        </div>
        <Button
          onClick={() => setRecordModalOpen(true)}
          icon={<Plus size={15} />}
          className="h-9 shrink-0 shadow-sm"
        >
          {isAmharic ? "ክፍያ መዝግብ" : "Record Payment"}
        </Button>
      </div>

      {error ? (
        <ErrorState description={error} onRetry={fetchPayments} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState
          title={isAmharic ? "ምንም የክፍያ መዝገብ አልተገኘም" : "No payments found"}
          description={isAmharic ? "በተመረጡት ማጣሪያዎች መሰረት የተገኘ የሰበካ ክፍያ የለም።" : "There are no Sebeka payments matching your current filters."}
          actionLabel={isAmharic ? "ማጣሪያዎችን አጽዳ" : "Clear Filters"}
          onAction={clearFilters}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAmharic ? "የደረሰኝ ቁጥር" : "Receipt No."}</TableHead>
                  <TableHead>{isAmharic ? "ቤተሰብ" : "Family"}</TableHead>
                  <TableHead>{isAmharic ? "ዓመት" : "Year"}</TableHead>
                  <TableHead>{isAmharic ? "የሚጠበቅ" : "Expected"}</TableHead>
                  <TableHead>{isAmharic ? "የተከፈለ" : "Paid"}</TableHead>
                  <TableHead>{isAmharic ? "ቀሪ እዳ" : "Balance"}</TableHead>
                  <TableHead>{isAmharic ? "የተከፈለበት ቀን" : "Payment Date"}</TableHead>
                  <TableHead>{isAmharic ? "ፎቶ" : "Doc"}</TableHead>
                  <TableHead>{isAmharic ? "ሁኔታ" : "Status"}</TableHead>
                  <TableHead className="text-right">{isAmharic ? "ተግባር" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((p) => {
                  const expected = Number(p.expectedAmount);
                  const paid = Number(p.paidAmount);
                  const balance = expected - paid;
                  const receiptDisplay = p.receiptNumber || p.id.slice(0, 8);

                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => {
                        setSelectedPayment(p);
                        setDetailOpen(true);
                      }}
                      className="cursor-pointer transition-colors hover:bg-background-alt/60"
                    >
                      <TableCell className="font-semibold text-primary">
                        {receiptDisplay}
                      </TableCell>
                      <TableCell className="font-semibold text-text-primary">
                        {p.family.name}
                      </TableCell>
                      <TableCell className="text-text-secondary">{p.year}</TableCell>
                      <TableCell className="text-text-secondary">{expected.toLocaleString()} ETB</TableCell>
                      <TableCell className="font-medium text-success">{paid.toLocaleString()} ETB</TableCell>
                      <TableCell className={balance > 0 ? "font-medium text-danger" : "text-text-muted"}>
                        {balance <= 0 ? "0 ETB" : `${balance.toLocaleString()} ETB`}
                      </TableCell>
                      <TableCell className="text-text-secondary">{formatDate(p.paymentDate)}</TableCell>
                      <TableCell>
                        {p.receiptUrl ? (
                          <span
                            title={isAmharic ? "የደረሰኝ ፎቶ ተያይዟል" : "Receipt attached"}
                            className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[11px] font-medium text-gold"
                          >
                            <ImageIcon size={12} />
                            <span>{isAmharic ? "አለ" : "Yes"}</span>
                          </span>
                        ) : (
                          <span className="text-[11.5px] text-text-muted">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge tone={statusTone[p.status]}>
                          {p.status === "Paid"
                            ? (isAmharic ? "የተከፈለ" : "Paid")
                            : p.status === "Partial"
                            ? (isAmharic ? "ከፊል የተከፈለ" : "Partial")
                            : p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayment(p);
                            setDetailOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-text-primary transition-colors hover:bg-background-alt hover:border-primary/40 shadow-sm"
                        >
                          <Eye size={13} className="text-primary" />
                          <span>{isAmharic ? "ዝርዝር" : "Detail"}</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

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

      {/* Payment Detail Dialog with Back Button */}
      <FamilyPaymentDetailDialog
        payment={selectedPayment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Quick Record Modal */}
      {recordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setRecordModalOpen(false)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-modal animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <FamilyPaymentForm
              onCancel={() => setRecordModalOpen(false)}
              onSubmit={handleRecordSubmit}
              submitError={recordError}
              submitting={recordSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
