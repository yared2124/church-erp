"use client";

import { useSession } from "next-auth/react";
import { X, User, Calendar, UserCheck, FileText, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiCertificateRequest } from "./certificate-table";

type CertificateStatus = "Pending" | "Approved" | "Rejected" | "Issued";

const statusTone: Record<CertificateStatus, BadgeTone> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
  Issued: "info",
};

const typeLabel: Record<ApiCertificateRequest["type"], string> = {
  Baptism: "Baptism",
  Marriage: "Marriage",
  Burial: "Burial",
};

const WORKFLOW_STEPS: { label: string; statuses: CertificateStatus[] }[] = [
  { label: "Request Submitted", statuses: ["Pending", "Approved", "Rejected", "Issued"] },
  { label: "Under Review", statuses: ["Pending"] },
  { label: "Approved", statuses: ["Approved", "Issued"] },
  { label: "Certificate Generated", statuses: ["Issued"] },
  { label: "Issued", statuses: ["Issued"] },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function Field({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-text-muted" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-text-muted">{label}</p>
        <p className="text-[13.5px] font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

export function CertificateDetailPanel({ request, onClose }: { request: ApiCertificateRequest | null; onClose: () => void }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("Super Admin");

  if (!request) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
        <FileText size={28} className="text-text-muted" />
        <p className="text-card-title text-text-primary">No request selected</p>
        <p className="max-w-[220px] text-small text-text-secondary">Select a row in the table to view request details here.</p>
      </Card>
    );
  }

  const currentStepIndex =
    request.status === "Pending" ? 1 : request.status === "Approved" ? 2 : request.status === "Rejected" ? 1 : 4;

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-light px-5 pb-3 pt-5">
        <h3 className="text-card-title text-text-primary">Request Details</h3>
        <button onClick={onClose} aria-label="Close details" className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-background-alt">
          <X size={16} />
        </button>
      </div>

      <div className="px-5 pt-4">
        <Badge tone={statusTone[request.status]}>{request.status}</Badge>
        <p className="mt-2 text-[12.5px] text-text-muted">Request ID</p>
        <p className="text-[15px] font-bold text-text-primary">{request.id.slice(0, 8)}</p>
      </div>

      <div className="divide-y divide-border-light px-5 py-2">
        <Field icon={FileText} label="Certificate Type" value={`${typeLabel[request.type]} Certificate`} />
        <Field icon={User} label="Member" value={`${request.member.firstName} ${request.member.lastName}`} />
        <Field icon={Calendar} label="Date of Birth" value={formatDate(request.member.dateOfBirth)} />
        <Field icon={UserCheck} label="Requested By" value={request.requestedBy.name} />
        <Field icon={Calendar} label="Request Date" value={formatDate(request.createdAt)} />
        {request.purpose && <Field icon={FileText} label="Purpose" value={request.purpose} />}
        {request.notes && <Field icon={FileText} label="Notes" value={request.notes} />}
      </div>

      <div className="px-5 py-3">
        <p className="mb-2 text-[12.5px] font-semibold text-text-secondary">Request Workflow</p>
        <div className="flex flex-col gap-3">
          {WORKFLOW_STEPS.map((step, i) => {
            const done = i <= currentStepIndex && step.statuses.includes(request.status);
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.label} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    done ? "bg-primary text-white" : "border-2 border-border bg-surface"
                  }`}
                >
                  {done && <Check size={11} />}
                </span>
                <div>
                  <p className={`text-[13px] ${isCurrent ? "font-semibold text-text-primary" : "text-text-secondary"}`}>{step.label}</p>
                  {isCurrent && <p className="text-[11.5px] text-text-muted">Current step</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdmin ? (
        <div className="flex gap-2 border-t border-border-light px-5 py-4">
          <Button className="flex-1">Review Request</Button>
          <Button variant="danger" className="flex-1">Reject Request</Button>
        </div>
      ) : (
        <div className="border-t border-border-light px-5 py-3.5 bg-background-alt text-center">
          <p className="text-[12.5px] font-medium text-text-secondary">
            ይህ ማመልከቻ በአስተዳዳሪ (Admin) ግምገማ ላይ ነው። ሰርቲፊኬት የሚዘጋጀው በአስተዳዳሪ ብቻ ነው።
          </p>
        </div>
      )}
    </Card>
  );
}
