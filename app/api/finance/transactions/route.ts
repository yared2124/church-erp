import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { financeService } from "@/features/finance/finance.service";
import { listTransactionsQuerySchema } from "@/features/finance/finance.validation";

// GET /api/finance/transactions?search=&type=&status=&category=&page=&limit=
export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const url = new URL(req.url);
  const parsed = listTransactionsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await financeService.listTransactions(parsed.data);
  return NextResponse.json(result);
});
