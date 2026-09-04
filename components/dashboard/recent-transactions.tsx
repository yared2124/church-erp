import { PiggyBank, Home, Boxes, Church, Wallet2, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface TransactionRow {
  id: string;
  description: string;
  type: "Income" | "Expense";
  amount: string;
  transactionDate: string | Date;
  category: { name: string };
}

function iconFor(categoryName: string): { icon: LucideIcon; bg: string; color: string } {
  const name = categoryName.toLowerCase();
  if (name.includes("sebeka")) return { icon: PiggyBank, bg: "bg-success-bg", color: "text-success" };
  if (name.includes("rent")) return { icon: Home, bg: "bg-success-bg", color: "text-success" };
  if (name.includes("donation")) return { icon: Church, bg: "bg-success-bg", color: "text-success" };
  if (name.includes("office") || name.includes("supplies")) return { icon: Boxes, bg: "bg-danger-bg", color: "text-danger" };
  return { icon: Wallet2, bg: "bg-danger-bg", color: "text-danger" };
}

function formatRelativeTime(iso: string | Date) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function RecentTransactions({ transactions }: { transactions: TransactionRow[] }) {
  return (
    <Card className="xl:col-span-4">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <a href="/finance/transactions" className="text-[13px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover">
          View All
        </a>
      </CardHeader>

      {transactions.length === 0 ? (
        <EmptyState title="No transactions yet" description="Transactions will appear here once recorded." />
      ) : (
        <div className="flex flex-col">
          {transactions.map((t, i) => {
            const { icon: Icon, bg, color } = iconFor(t.category.name);
            const positive = t.type === "Income";
            return (
              <div
                key={t.id}
                className={`flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-background-alt ${
                  i < transactions.length - 1 ? "border-b border-border-light" : ""
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${bg}`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-text-primary">{t.description}</p>
                  <p className="text-[12px] text-text-secondary">{t.category.name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-[13px] font-bold ${positive ? "text-success" : "text-danger"}`}>
                    {positive ? "+" : "-"}
                    {Number(t.amount).toLocaleString()} ETB
                  </p>
                  <p className="text-[11.5px] text-text-muted">{formatRelativeTime(t.transactionDate)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
