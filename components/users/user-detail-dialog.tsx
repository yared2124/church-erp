"use client";

import * as React from "react";
import {
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  ArrowLeft,
  KeyRound,
  Edit2,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";
import type { ApiSystemUser } from "./user-table";

type UserStatus = "Active" | "Inactive" | "Locked";
const statusTone: Record<UserStatus, BadgeTone> = { Active: "success", Inactive: "neutral", Locked: "danger" };

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" });
}

interface UserDetailDialogProps {
  user: ApiSystemUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (user: ApiSystemUser) => void;
}

export function UserDetailDialog({ user, open, onOpenChange, onEdit }: UserDetailDialogProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface shadow-modal animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-primary/90 to-sidebar text-[16px] font-bold text-gold shadow-glow-gold">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] font-semibold text-text-primary">{user.name}</h2>
                <Badge tone={statusTone[user.status]}>{user.status}</Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">{user.email}</p>
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
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <DetailField icon={User} label={isAmharic ? "ሙሉ ስም" : "Full Name"} value={user.name} />
            <DetailField icon={Mail} label={isAmharic ? "ኢሜይል" : "Email Address"} value={user.email} />
            <DetailField
              icon={Shield}
              label={isAmharic ? "የተጠቃሚ ሚናዎች" : "Assigned Roles"}
              value={
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user.roles.length > 0 ? (
                    user.roles.map((r) => (
                      <Badge key={r.role.id} tone="info">{r.role.name}</Badge>
                    ))
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </div>
              }
            />
            <DetailField
              icon={Clock}
              label={isAmharic ? "የመጨረሻ መግቢያ" : "Last Login"}
              value={formatDateTime(user.lastLoginAt)}
            />
            <DetailField
              icon={Calendar}
              label={isAmharic ? "አካውንት የተፈጠረበት" : "Created At"}
              value={formatDateTime(user.createdAt)}
            />
            <DetailField
              icon={KeyRound}
              label={isAmharic ? "የአካውንት ሁኔታ" : "Account Status"}
              value={<Badge tone={statusTone[user.status]}>{user.status}</Badge>}
            />
          </div>
        </div>

        {/* Footer with BACK button and Edit */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-alt/30 p-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            icon={<ArrowLeft size={16} />}
            className="rounded-lg border-border font-medium"
          >
            {isAmharic ? "ተመለስ (Back)" : "Back to Table"}
          </Button>

          {onEdit && (
            <Button
              variant="primary"
              onClick={() => {
                onOpenChange(false);
                onEdit(user);
              }}
              icon={<Edit2 size={15} />}
              className="rounded-lg font-medium"
            >
              {isAmharic ? "አካውንት አሻሽል" : "Edit User"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-text-muted">
        <Icon size={14} className="text-gold" />
        <span className="text-[11.5px] font-medium">{label}</span>
      </div>
      <div className="mt-1 text-[13px] font-medium text-text-primary">{value}</div>
    </div>
  );
}
