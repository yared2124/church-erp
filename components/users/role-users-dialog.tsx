"use client";

import * as React from "react";
import { X, ShieldCheck, User, Mail, Clock, ArrowLeft, Eye } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { useLanguage } from "@/lib/language-context";
import type { ApiSystemUser } from "./user-table";
import { UserDetailDialog } from "./user-detail-dialog";

type UserStatus = "Active" | "Inactive" | "Locked";
const statusTone: Record<UserStatus, BadgeTone> = { Active: "success", Inactive: "neutral", Locked: "danger" };

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" });
}

interface RoleUsersDialogProps {
  roleName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleUsersDialog({ roleName, open, onOpenChange }: RoleUsersDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [users, setUsers] = React.useState<ApiSystemUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<ApiSystemUser | null>(null);

  React.useEffect(() => {
    if (open && roleName) {
      setLoading(true);
      setError(null);
      apiFetch<Paginated<ApiSystemUser>>(`/api/users?role=${encodeURIComponent(roleName)}&limit=50`)
        .then((res) => setUsers(res.data))
        .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load users."))
        .finally(() => setLoading(false));
    } else {
      setUsers([]);
    }
  }, [open, roleName]);

  if (!open || !roleName) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-surface shadow-modal animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-primary/90 to-sidebar shadow-glow-gold">
                <EthiopicCross size={22} variant="gold" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-semibold text-text-primary">
                    {roleName} {isAmharic ? "ሚና ያላቸው ተጠቃሚዎች" : "Role Members"}
                  </h2>
                  <Badge tone="info">{users.length} {isAmharic ? "ተጠቃሚዎች" : "users"}</Badge>
                </div>
                <p className="mt-0.5 text-[12.5px] text-text-secondary">
                  {isAmharic
                    ? `ይህንን «${roleName}» ሚና የተሰጣቸው የሲስተም ተጠቃሚዎች ዝርዝር`
                    : `System accounts currently assigned the "${roleName}" permission role`}
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {error ? (
              <ErrorState description={error} />
            ) : loading ? (
              <div className="divide-y divide-border-light">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ListRowSkeleton key={i} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                title={isAmharic ? "ምንም ተጠቃሚ የለም" : "No users in this role"}
                description={isAmharic ? "ይህ ሚና የተሰጠው ምንም ተጠቃሚ አልተገኘም።" : "No user accounts have been assigned this role yet."}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">{isAmharic ? "ተጠቃሚ" : "User"}</TableHead>
                    <TableHead className="whitespace-nowrap">{isAmharic ? "ኢሜይል" : "Email"}</TableHead>
                    <TableHead className="whitespace-nowrap">{isAmharic ? "ሁኔታ" : "Status"}</TableHead>
                    <TableHead className="whitespace-nowrap">{isAmharic ? "የመጨረሻ መግቢያ" : "Last Login"}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{isAmharic ? "ተግባር" : "Action"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="cursor-pointer transition-colors hover:bg-background-alt/60"
                    >
                      <TableCell className="font-semibold text-text-primary whitespace-nowrap">
                        {u.name}
                      </TableCell>
                      <TableCell className="text-text-secondary whitespace-nowrap">
                        {u.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge tone={statusTone[u.status]}>{u.status}</Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary whitespace-nowrap">
                        {formatDateTime(u.lastLoginAt)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          title="የተጠቃሚውን ዝርዝር እይ / View User Details"
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-[12px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt hover:border-primary/40"
                        >
                          <Eye size={13} className="text-primary" />
                          <span className="hidden sm:inline">{isAmharic ? "ዝርዝር" : "Detail"}</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Footer with BACK button */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-alt/30 p-4">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              icon={<ArrowLeft size={16} />}
              className="rounded-lg border-border font-medium"
            >
              {isAmharic ? "ተመለስ (Back)" : "Back to Roles"}
            </Button>
          </div>
        </div>
      </div>

      {/* Nested User Detail Dialog if a user is clicked */}
      <UserDetailDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      />
    </>
  );
}
