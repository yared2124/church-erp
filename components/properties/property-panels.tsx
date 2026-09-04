import { Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RentPaymentRow {
  id: string;
  amount: unknown;
  paymentDate: Date | string | null;
  leaseAgreement: { tenant: { name: string }; property: { unitName: string } };
}

interface LeaseRow {
  id: string;
  endDate: Date | string;
  tenant: { name: string; phone: string | null };
  property: { unitName: string };
}

function formatDate(iso: Date | string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function monthsUntil(date: Date | string) {
  const now = new Date();
  const target = new Date(date);
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
}

export function RecentRentPaymentsCard({ payments }: { payments: RentPaymentRow[] }) {
  return (
    <Card className="xl:col-span-6">
      <CardHeader>
        <CardTitle>Recent Rent Payments</CardTitle>
      </CardHeader>
      {payments.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">No rent payments recorded yet.</p>
      ) : (
        <div className="flex flex-col">
          {payments.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between py-2.5 ${i < payments.length - 1 ? "border-b border-border-light" : ""}`}>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-text-primary">{p.leaseAgreement.tenant.name}</p>
                <p className="text-[12px] text-text-secondary">{p.leaseAgreement.property.unitName}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-bold text-success">+{Number(p.amount).toLocaleString()} ETB</p>
                <Badge tone="success">Paid</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function ActiveTenantsCard({ leases }: { leases: LeaseRow[] }) {
  return (
    <Card className="xl:col-span-6">
      <CardHeader>
        <CardTitle>Active Tenants</CardTitle>
      </CardHeader>
      {leases.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">No active leases yet.</p>
      ) : (
        <div className="flex flex-col">
          {leases.map((l, i) => (
            <div key={l.id} className={`flex items-center justify-between py-2.5 ${i < leases.length - 1 ? "border-b border-border-light" : ""}`}>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-text-primary">{l.tenant.name}</p>
                <p className="text-[12px] text-text-secondary">{l.property.unitName} · {l.tenant.phone ?? "—"}</p>
              </div>
              <p className="shrink-0 text-[12px] text-text-muted">Ends {formatDate(l.endDate)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function OverdueRentalsCard({ overdue }: { overdue: RentPaymentRow[] }) {
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>Overdue Rentals</CardTitle>
      </CardHeader>
      {overdue.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">No overdue rentals — nice work.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {overdue.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text-primary">{r.leaseAgreement.property.unitName}</p>
                <p className="text-[11.5px] text-text-secondary">{r.leaseAgreement.tenant.name}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12.5px] font-bold text-danger">{Number(r.amount).toLocaleString()} ETB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function PropertyMaintenanceCard({ maintenance }: { maintenance: { open: number; urgent: number; inProgress: number; scheduled: number } }) {
  const m = maintenance;
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>Property Maintenance</CardTitle>
      </CardHeader>
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <Wrench size={26} className="text-primary" />
        </div>
        <p className="text-[24px] font-bold text-text-primary">{m.open}</p>
        <p className="text-[12.5px] text-text-secondary">Open Requests</p>
      </div>
      <div className="mt-2 flex flex-col gap-2 text-[12.5px]">
        <Row label="Urgent" value={m.urgent} tone="danger" />
        <Row label="In Progress" value={m.inProgress} tone="warning" />
        <Row label="Scheduled" value={m.scheduled} tone="info" />
      </div>
    </Card>
  );
}

function Row({ label, value, tone }: { label: string; value: number; tone: "danger" | "warning" | "info" }) {
  const dot = { danger: "bg-danger", warning: "bg-warning", info: "bg-info" }[tone];
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-text-secondary">
        <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
      </span>
      <span className="font-semibold text-text-primary">{value}</span>
    </div>
  );
}

export function UpcomingLeaseExpiryCard({ leases }: { leases: LeaseRow[] }) {
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>Upcoming Lease Expiry</CardTitle>
      </CardHeader>
      {leases.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">No upcoming lease expirations.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {leases.map((l) => (
            <div key={l.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-[13px] font-semibold text-text-primary">{l.property.unitName}</p>
                <p className="text-[11.5px] text-text-secondary">{l.tenant.name}</p>
              </div>
              <p className="text-[12px] font-medium text-text-muted">in {monthsUntil(l.endDate)} months</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
