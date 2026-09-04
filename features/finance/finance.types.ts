export type TransactionType = "Income" | "Expense";
export type TransactionStatus = "Paid" | "Pending" | "Approved" | "Rejected";
export type PaymentMethod = "Cash" | "BankTransfer" | "MobileMoney";

export interface ApiTransaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: string; // Prisma Decimal → string over JSON
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  transactionDate: string;
  createdAt: string;
  category: { id: string; name: string };
  createdBy: { id: string; name: string };
}

export interface CategoryBreakdown {
  label: string;
  value: number;
  pct: string;
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface FinanceOverviewResponse {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingApprovals: number;
  thisMonthCollections: number;
  openingBalance: number;
  incomeByCategory: CategoryBreakdown[];
  expenseByCategory: CategoryBreakdown[];
  monthlyTrend: MonthlyTrendPoint[];
}

export function paymentMethodLabel(m: PaymentMethod) {
  return { Cash: "Cash", BankTransfer: "Bank Transfer", MobileMoney: "Mobile Money" }[m];
}
