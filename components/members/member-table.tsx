"use client";

import * as React from "react";
import { MoreHorizontal, Cross } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/input";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { PriestSacramentDialog } from "@/components/sacraments/priest-sacrament-dialog";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { memberFullName, type ApiMember } from "@/features/members/member.types";

const statusTone: Record<ApiMember["status"], BadgeTone> = {
  Active: "success",
  Inactive: "neutral",
  Transferred: "info",
  Deceased: "neutral",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

interface MemberTableProps {
  selectedId: string | null;
  onSelect: (member: ApiMember) => void;
  /** Bumped by the parent after a create/edit/delete to force a refetch. */
  refreshKey?: number;
}

export function MemberTable({ selectedId, onSelect, refreshKey = 0 }: MemberTableProps) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState(""); // debounced
  const [status, setStatus] = React.useState("all");
  const [role, setRole] = React.useState("all");
  const [sebeka, setSebeka] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [sacramentModalOpen, setSacramentModalOpen] = React.useState(false);
  const [sacramentTargetId, setSacramentTargetId] = React.useState<string | undefined>();

  const [result, setResult] = React.useState<Paginated<ApiMember> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Debounce free-text search so we don't hit the API on every keystroke.
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [search, status, role, sebeka, pageSize]);

  const fetchMembers = React.useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (role !== "all") params.set("roleInFamily", role);
    if (sebeka !== "all") params.set("sebekaStatus", sebeka);

    apiFetch<Paginated<ApiMember>>(`/api/members?${params.toString()}`)
      .then(setResult)
      .catch((err) => {
        setError(err instanceof ApiClientError ? err.message : "Failed to load members.");
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, search, status, role, sebeka]);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers, refreshKey]);

  const clearFilters = () => {
    setSearchInput("");
    setStatus("all");
    setRole("all");
    setSebeka("all");
  };

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search members..."
        filters={[
          {
            key: "status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "All Status" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Transferred", label: "Transferred" },
              { value: "Deceased", label: "Deceased" },
            ],
          },
          {
            key: "sebeka",
            value: sebeka,
            onChange: setSebeka,
            options: [
              { value: "all", label: "All Sebeka (ሰበካ)" },
              { value: "Paid", label: "Paid (የተከፈለ)" },
              { value: "Unpaid", label: "Unpaid (ያልተከፈለ)" },
            ],
          },
          {
            key: "role",
            value: role,
            onChange: setRole,
            options: [
              { value: "all", label: "All Roles" },
              { value: "Head", label: "Head" },
              { value: "Wife", label: "Wife" },
              { value: "Husband", label: "Husband" },
              { value: "Son", label: "Son" },
              { value: "Daughter", label: "Daughter" },
            ],
          },
        ]}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState description={error} onRetry={fetchMembers} />
      ) : loading ? (
        <div className="divide-y divide-border-light">
          {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : !result || result.data.length === 0 ? (
        <EmptyState
          title="No members found"
          description="There are no members matching your current filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox aria-label="Select all" /></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Sebeka (ሰበካ)</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((m) => (
                <TableRow key={m.id} selected={m.id === selectedId} onClick={() => onSelect(m)} className="cursor-pointer">
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox aria-label={`Select ${memberFullName(m)}`} />
                  </TableCell>
                  <TableCell className="font-medium text-text-secondary">{m.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-semibold text-text-primary">{memberFullName(m)}</TableCell>
                  <TableCell className="text-text-secondary">{m.family.name}</TableCell>
                  <TableCell className="text-text-secondary">{m.roleInFamily}</TableCell>
                  <TableCell>
                    <Badge tone={m.family?.sebekaStatus === "Paid" ? "success" : "warning"}>
                      {m.family?.sebekaStatus === "Paid" ? "የተከፈለ" : "ያልተከፈለ"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary">{m.gender}</TableCell>
                  <TableCell className="text-text-secondary">{m.phone ?? "—"}</TableCell>
                  <TableCell><Badge tone={statusTone[m.status]}>{m.status}</Badge></TableCell>
                  <TableCell className="text-text-secondary">{formatDate(m.membershipDate)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="የምስጢራት ጥያቄ አቅርብ / Request Sacrament"
                        onClick={() => {
                          setSacramentTargetId(m.id);
                          setSacramentModalOpen(true);
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-gold/40 px-2 text-[12px] font-semibold text-gold transition-colors duration-150 hover:bg-gold/10"
                      >
                        <Cross size={13} />
                        <span className="hidden sm:inline">ማመልከቻ</span>
                      </button>
                      <button aria-label={`More actions for ${memberFullName(m)}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

          <PriestSacramentDialog
            open={sacramentModalOpen}
            onOpenChange={setSacramentModalOpen}
            defaultMemberId={sacramentTargetId}
            onSuccess={fetchMembers}
          />
        </>
      )}
    </div>
  );
}
