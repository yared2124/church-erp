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

type StockStatus = "InStock" | "LowStock" | "OutOfStock";

interface ApiInventoryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
  location: string | null;
  status: StockStatus;
  category: { id: string; name: string };
}

const statusTone: Record<StockStatus, BadgeTone> = {
  InStock: "success",
  LowStock: "warning",
  OutOfStock: "danger",
};

const statusLabel: Record<StockStatus, string> = {
  InStock: "In Stock",
  LowStock: "Low Stock",
  OutOfStock: "Out of Stock",
};

export function InventoryTable() {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);

  const [result, setResult] = React.useState<Paginated<ApiInventoryItem> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, status, pageSize]);

  const fetchItems = React.useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);

    apiFetch<Paginated<ApiInventoryItem>>(`/api/inventory?${params.toString()}`)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load items."))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, status]);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const clearFilters = () => {
    setSearchInput("");
    setStatus("all");
  };

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search items..."
        filters={[
          { key: "status", value: status, onChange: setStatus, options: [
            { value: "all", label: "All Status" },
            { value: "InStock", label: "In Stock" },
            { value: "LowStock", label: "Low Stock" },
            { value: "OutOfStock", label: "Out of Stock" },
          ] },
        ]}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState description={error} onRetry={fetchItems} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 4 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No items found" description="There are no inventory items matching your current filters." actionLabel="Clear Filters" onAction={clearFilters} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox aria-label="Select all" /></TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price (ETB)</TableHead>
                <TableHead>Total Value (ETB)</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((i) => (
                <TableRow key={i.id}>
                  <TableCell><Checkbox aria-label={`Select ${i.name}`} /></TableCell>
                  <TableCell className="font-semibold text-text-primary">{i.name}</TableCell>
                  <TableCell className="text-text-secondary">{i.category.name}</TableCell>
                  <TableCell className="text-text-secondary">{i.quantity}</TableCell>
                  <TableCell className="text-text-secondary">{Number(i.unitPrice).toLocaleString()}</TableCell>
                  <TableCell className="text-text-secondary">{(i.quantity * Number(i.unitPrice)).toLocaleString()}</TableCell>
                  <TableCell className="text-text-secondary">{i.location ?? "—"}</TableCell>
                  <TableCell><Badge tone={statusTone[i.status]}>{statusLabel[i.status]}</Badge></TableCell>
                  <TableCell className="text-right">
                    <button aria-label={`More actions for ${i.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination page={result.pagination.page} pageCount={result.pagination.totalPages} pageSize={result.pagination.limit} pageSizeOptions={[8, 25, 50]} totalItems={result.pagination.total} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  );
}
