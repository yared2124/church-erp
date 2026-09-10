"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { ApiSystemUser } from "./user-table";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: ApiSystemUser | null;
  roleOptions: string[];
}

export function UserModal({ open, onClose, onSaved, user, roleOptions }: UserModalProps) {
  const isEdit = !!user;

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState(roleOptions[0] ?? "Member");
  const [status, setStatus] = React.useState<"Active" | "Inactive" | "Locked">("Active");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setPhone("");
      setRole(user.roles[0]?.role.name ?? roleOptions[0] ?? "Member");
      setStatus(user.status);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRole(roleOptions[0] ?? "Member");
      setStatus("Active");
    }
    setError(null);
  }, [user, open, roleOptions]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit) {
        await apiFetch(`/api/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name,
            email,
            password: password.trim() ? password : undefined,
            phone: phone.trim() ? phone : undefined,
            role,
            status,
          }),
        });
      } else {
        await apiFetch("/api/users", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            phone: phone.trim() ? phone : undefined,
            role,
            status,
          }),
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save user. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-[17px] font-bold text-text-primary">
              {isEdit ? "Edit User" : "Add New User"}
            </h2>
            <p className="text-[13px] text-text-secondary">
              {isEdit ? "Update user profile, credentials, and access roles" : "Create a new church ERP user account"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-background-alt hover:text-text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {error && (
            <div className="rounded-md border border-danger-bg bg-danger-bg px-4 py-2.5 text-[13px] text-danger">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            required
            placeholder="e.g. Abba Yohannes"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. user@stmarychurch.et"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
            type="password"
            required={!isEdit}
            placeholder={isEdit ? "••••••••" : "At least 6 characters"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="0911 234 567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Assigned Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roleOptions.map((r) => ({ value: r, label: r }))}
            />

            <Select
              label="Account Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "Active" | "Inactive" | "Locked")}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Locked", label: "Locked" },
              ]}
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
