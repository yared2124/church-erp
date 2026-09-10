import { Home } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface OverdueRentPayment {
  id: string;
  amount: string;
  leaseAgreement: { tenant: { name: string }; property: { unitName: string } };
}

export function OverdueRentals({ rentals, className }: { rentals: OverdueRentPayment[]; className?: string }) {
  return (
    <Card hoverable className={cn("lg:col-span-4", className)}>
      <CardHeader>
        <div>
          <CardTitle>Overdue Rentals</CardTitle>
          <p className="mt-0.5 text-[12px] text-text-muted">Uncollected property dues</p>
        </div>
        <a
          href="/property"
          className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-primary transition-colors duration-150 hover:bg-primary-light"
        >
          View All
        </a>
      </CardHeader>
      {rentals.length === 0 ? (
        <EmptyState title="No overdue rentals" description="All rental accounts are up to date." />
      ) : (
        <div className="flex flex-col gap-0.5">
          {rentals.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 transition-colors duration-150 hover:bg-background-alt">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-danger-bg">
                <Home size={15} className="text-danger" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-text-primary">{r.leaseAgreement.property.unitName}</p>
                <p className="text-[11.5px] text-text-secondary">{r.leaseAgreement.tenant.name}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12px] font-semibold text-text-primary">{Number(r.amount).toLocaleString()} ETB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
