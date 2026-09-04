import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling } from "@/lib/api-helpers";
import { familyPaymentService } from "@/features/family-payments/family-payment.service";

export const GET = withErrorHandling(async () => {
  await requireAuth();
  const stats = await familyPaymentService.stats();
  return NextResponse.json({ data: stats });
});
