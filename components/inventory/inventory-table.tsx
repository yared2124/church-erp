"use client";

import * as React from "react";
import { MoreHorizontal, Eye } from "lucide-react";
import { InventoryDetailDialog } from "./inventory-detail-dialog";
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
  const [selected, setSelected] = React.useState<ApiInventoryItem | null>(null);
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
                <TableHead className="w-10 whitespace-nowrap"><Checkbox aria-label="Select all" /></TableHead>
                <TableHead className="whitespace-nowrap">Item Name</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Quantity</TableHead>
                <TableHead className="whitespace-nowrap">Unit Price (ETB)</TableHead>
                <TableHead className="whitespace-nowrap">Total Value (ETB)</TableHead>
                <TableHead className="whitespace-nowrap">Location</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((i) => (
                <TableRow
                  key={i.id}
                  onClick={() => setSelected(i)}
                  className="cursor-pointer transition-colors hover:bg-background-alt/60"
                >
                  <TableCell onClick={(e) => e.stopPropagation()} className="whitespace-nowrap"><Checkbox aria-label={`Select ${i.name}`} /></TableCell>
                  <TableCell className="font-semibold text-text-primary whitespace-nowrap">{i.name}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{i.category.name}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{i.quantity}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{Number(i.unitPrice).toLocaleString()}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{(i.quantity * Number(i.unitPrice)).toLocaleString()}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">{i.location ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap"><Badge tone={statusTone[i.status]}>{statusLabel[i.status]}</Badge></TableCell>
                  <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="የዕቃውን ዝርዝር እይ / View Item Detail"
                        onClick={() => setSelected(i)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-[12px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt hover:border-primary/40"
                      >
                        <Eye size={13} className="text-primary" />
                        <span className="hidden sm:inline">ዝርዝር</span>
                      </button>
                      <button aria-label={`More actions for ${i.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination page={result.pagination.page} pageCount={result.pagination.totalPages} pageSize={result.pagination.limit} pageSizeOptions={[8, 25, 50]} totalItems={result.pagination.total} onPageChange={setPage} onPageSizeChange={setPageSize} />

          {/* Pop-up Modal Dialog with Back Button */}
          <InventoryDetailDialog
            item={selected}
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
