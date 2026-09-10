"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { ApiSystemUser } from "./user-table";

interface UserDeleteDialogProps {
  open: boolean;
  user: ApiSystemUser | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function UserDeleteDialog({ open, user, onClose, onDeleted }: UserDeleteDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!open || !user) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/users/${user.id}`, { method: "DELETE" });
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-modal">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-text-primary">Delete User</h3>
            <p className="mt-1 text-[13px] text-text-secondary">
              Are you sure you want to remove <strong className="text-text-primary">{user.name}</strong> ({user.email})?
            </p>
            <p className="mt-2 text-[12px] text-text-muted">
              Note: If this user has recorded historical sacraments, transactions, or certificates, the account will be safely deactivated to preserve audit integrity.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-danger-bg bg-danger-bg px-3.5 py-2 text-[12.5px] text-danger">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
