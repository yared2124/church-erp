import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling } from "@/lib/api-helpers";
import { financeService } from "@/features/finance/finance.service";

// GET /api/finance/stats
export const GET = withErrorHandling(async () => {
  await requireAuth();
  const overview = await financeService.overview();
  return NextResponse.json({ data: overview });
});
