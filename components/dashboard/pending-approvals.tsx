import { Wallet2, FileBadge2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface PendingExpense {
  id: string;
  description: string;
  amount: string;
  createdBy: { name: string };
}

interface PendingCertRequest {
  id: string;
  type: "Baptism" | "Marriage" | "Burial";
  member: { firstName: string; lastName: string };
  requestedBy: { name: string };
}

interface PendingApprovalsProps {
  pendingExpenses: PendingExpense[];
  pendingCertRequests: PendingCertRequest[];
  className?: string;
}

export function PendingApprovals({ pendingExpenses, pendingCertRequests, className }: PendingApprovalsProps) {
  const isEmpty = pendingExpenses.length === 0 && pendingCertRequests.length === 0;

  return (
    <Card hoverable className={cn("lg:col-span-4", className)}>
      <CardHeader>
        <div>
          <CardTitle>Pending Approvals</CardTitle>
          <p className="mt-0.5 text-[12px] text-text-muted">Requests requiring signature</p>
        </div>
        <a
          href="/finance/expenses"
          className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-primary transition-colors duration-150 hover:bg-primary-light"
        >
          View All
        </a>
      </CardHeader>

      {isEmpty ? (
        <EmptyState title="Nothing pending" description="New requests will show up here for review." />
      ) : (
        <div className="flex flex-col gap-0.5">
          {pendingExpenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-background-alt">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning-bg">
                <Wallet2 size={18} className="text-warning" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-text-primary">Expense Request</p>
                <p className="text-[12px] text-text-secondary">{e.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-bold text-text-primary">{Number(e.amount).toLocaleString()} ETB</p>
                <p className="text-[11.5px] text-text-muted">By {e.createdBy.name}</p>
              </div>
            </div>
          ))}
          {pendingCertRequests.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-background-alt">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-info-bg">
                <FileBadge2 size={18} className="text-info" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-text-primary">Certificate Request</p>
                <p className="text-[12px] text-text-secondary">{c.type} — {c.member.firstName} {c.member.lastName}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11.5px] text-text-muted">By {c.requestedBy.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
