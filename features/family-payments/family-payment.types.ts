export type PaymentStatus = "Paid" | "Partial" | "Unpaid" | "Overdue";
export type PaymentMethod = "Cash" | "BankTransfer" | "MobileMoney";

export interface ApiFamilyPayment {
  id: string;
  familyId: string;
  year: number;
  expectedAmount: string; // Prisma Decimal serializes to a string over JSON
  paidAmount: string;
  paymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  status: PaymentStatus;
  receiptNumber: string | null;
  receiptUrl: string | null;
  notes: string | null;
  recordedById?: string | null;
  recordedBy?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  family: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface FamilyPaymentStatsResponse {
  totalCollected: number;
  expected: number;
  outstanding: number;
  familiesPaid: number;
  familiesUnpaid: number;
}

export function paymentMethodLabel(m: PaymentMethod | null) {
  if (!m) return "—";
  return { Cash: "Cash", BankTransfer: "Bank Transfer", MobileMoney: "Mobile Money" }[m];
}
