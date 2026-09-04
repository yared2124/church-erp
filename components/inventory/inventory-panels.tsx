import { Plus, ArrowLeftRight, ShoppingCart, Wrench, Printer, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  category: { name: string };
}

interface StockMovementRow {
  id: string;
  changeQty: number;
  movementType: "In" | "Out";
  createdAt: Date | string;
  item: { name: string };
}

const QUICK_ACTIONS = [
  { label: "Add New Item", sub: "Register a new asset or item", icon: Plus },
  { label: "Stock Movement", sub: "Record stock in/out", icon: ArrowLeftRight },
  { label: "Purchase Order", sub: "Create purchase order", icon: ShoppingCart },
  { label: "Maintenance Request", sub: "Report item for maintenance", icon: Wrench },
  { label: "Print Inventory List", sub: "Generate inventory report", icon: Printer },
];

export function InventoryQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} className="flex items-center gap-3 rounded-md border border-border px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-background-alt">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-light">
                <Icon size={17} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text-primary">{a.label}</p>
                <p className="text-[11.5px] text-text-secondary">{a.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function LowStockAlertsCard({ items }: { items: LowStockItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alerts</CardTitle>
      </CardHeader>
      {items.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">Nothing running low right now.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {items.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-danger-bg">
                <AlertTriangle size={16} className="text-danger" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-text-primary">{a.name}</p>
                <p className="text-[11.5px] text-text-secondary">{a.category.name}</p>
              </div>
              <span className="shrink-0 text-[12px] font-semibold text-danger">{a.quantity} left</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function RecentStockMovementsCard({ movements }: { movements: StockMovementRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Stock Movements</CardTitle>
      </CardHeader>
      {movements.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">No stock movements recorded yet.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {movements.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2">
              <div>
                <span className={`mr-2 text-[12.5px] font-bold ${m.movementType === "In" ? "text-success" : "text-danger"}`}>
                  {m.movementType === "In" ? "+" : "-"}{m.changeQty}
                </span>
                <span className="text-[13px] font-medium text-text-primary">{m.item.name}</span>
              </div>
              <div className="text-right">
                <Badge tone={m.movementType === "In" ? "success" : "danger"}>{m.movementType === "In" ? "Stock In" : "Stock Out"}</Badge>
                <p className="mt-0.5 text-[11px] text-text-muted">{new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
