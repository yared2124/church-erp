import { Home } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface OverdueRentPayment {
  id: string;
  amount: string;
  leaseAgreement: { tenant: { name: string }; property: { unitName: string } };
}

export function OverdueRentals({ rentals }: { rentals: OverdueRentPayment[] }) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Overdue Rentals</CardTitle>
        <a href="/property" className="text-[13px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover">
          View All
        </a>
      </CardHeader>
      {rentals.length === 0 ? (
        <EmptyState title="No overdue rentals" description="All rental accounts are up to date." />
      ) : (
        <div className="flex flex-col gap-0.5">
          {rentals.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-background-alt">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-danger-bg">
                <Home size={18} className="text-danger" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-text-primary">{r.leaseAgreement.property.unitName}</p>
                <p className="text-[12px] text-text-secondary">{r.leaseAgreement.tenant.name}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12.5px] font-bold text-text-primary">{Number(r.amount).toLocaleString()} ETB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
