import { z } from "zod";

export const listTransactionsQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(["Income", "Expense"]).optional(),
  status: z.enum(["Paid", "Pending", "Approved", "Rejected"]).optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
