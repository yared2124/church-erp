import { z } from "zod";

export const createFamilyPaymentSchema = z.object({
  familyId: z.string().min(1, "Please select a family."),
  year: z.coerce.number().int().min(2000).max(2100),
  expectedAmount: z.coerce.number().positive("Expected amount must be greater than zero."),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(["Cash", "BankTransfer", "MobileMoney"]).default("Cash"),
  receiptNumber: z.string().trim().min(1, "Physical receipt number is required."),
  receiptUrl: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  recordedById: z.string().optional(),
}).refine((data) => data.paidAmount <= data.expectedAmount, {
  message: "Paid amount cannot exceed the expected amount.",
  path: ["paidAmount"],
});

export const updateFamilyPaymentSchema = z.object({
  expectedAmount: z.coerce.number().positive().optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(["Cash", "BankTransfer", "MobileMoney"]).optional(),
  receiptNumber: z.string().trim().min(1).optional(),
  receiptUrl: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  recordedById: z.string().optional(),
});

export const listFamilyPaymentsQuerySchema = z.object({
  search: z.string().trim().optional(),
  year: z.coerce.number().int().optional(),
  status: z.enum(["Paid", "Partial", "Unpaid", "Overdue"]).optional(),
  paymentMethod: z.enum(["Cash", "BankTransfer", "MobileMoney"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateFamilyPaymentInput = z.infer<typeof createFamilyPaymentSchema>;
export type UpdateFamilyPaymentInput = z.infer<typeof updateFamilyPaymentSchema>;
export type ListFamilyPaymentsQuery = z.infer<typeof listFamilyPaymentsQuerySchema>;

/** Derives the Paid/Partial/Unpaid status from amounts — single source of truth for this rule. */
export function derivePaymentStatus(expected: number, paid: number, overdue: boolean): "Paid" | "Partial" | "Unpaid" | "Overdue" {
  if (paid >= expected && expected > 0) return "Paid";
  if (paid > 0) return "Partial";
  return overdue ? "Overdue" : "Unpaid";
}
