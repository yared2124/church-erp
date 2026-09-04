"use client";

import { X, Calendar, User, Tag, Database, Shield, Globe, Monitor, FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiAuditLog } from "./audit-log-table";

type AuditStatus = "Success" | "Failed";

const statusTone: Record<AuditStatus, BadgeTone> = { Success: "success", Failed: "danger" };

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
}

function Field({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-text-muted" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-text-muted">{label}</p>
        <p className="break-words text-[13.5px] font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

export function AuditLogDetailPanel({ log, onClose }: { log: ApiAuditLog | null; onClose: () => void }) {
  if (!log) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
        <FileText size={28} className="text-text-muted" />
        <p className="text-card-title text-text-primary">No log selected</p>
        <p className="max-w-[220px] text-small text-text-secondary">Select a row in the table to view full details here.</p>
      </Card>
    );
  }

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-light px-5 pb-3 pt-5">
        <h3 className="text-card-title text-text-primary">Log Details</h3>
        <button onClick={onClose} aria-label="Close details" className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
          <X size={16} />
        </button>
      </div>

      <div className="divide-y divide-border-light px-5 py-2">
        <Field icon={Calendar} label="Date & Time" value={formatDateTime(log.createdAt)} />
        <Field icon={User} label="User" value={log.user.name} />
        <Field icon={Tag} label="Action" value={<Badge tone="info">{log.action}</Badge>} />
        <Field icon={Database} label="Entity" value={log.entity} />
        <Field icon={Database} label="Entity ID" value={log.entityId} />
        <Field icon={Shield} label="Status" value={<Badge tone={statusTone[log.status]}>{log.status}</Badge>} />
        <Field icon={Globe} label="IP Address" value={log.ipAddress} />
        <Field icon={Monitor} label="User Agent" value={<span className="break-all text-[12px] text-text-secondary">{log.userAgent}</span>} />
        <Field icon={FileText} label="Description" value={log.description} />
      </div>

      {log.changes && (
        <div className="px-5 pb-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12.5px] font-semibold text-text-secondary">Changes</p>
            <Badge tone="info">{log.action}</Badge>
          </div>
          <pre className="overflow-x-auto rounded-md bg-text-primary p-3 text-[12px] leading-relaxed text-white scrollbar-thin">
{JSON.stringify(log.changes, null, 2)}
          </pre>
        </div>
      )}

      <div className="border-t border-border-light px-5 py-4">
        <Button variant="secondary" icon={<Download size={16} />} className="w-full">
          Download Full Log
        </Button>
      </div>
    </Card>
  );
}
