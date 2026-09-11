import { NextResponse } from "next/server";
import { requireAuth, requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { requestMetadata } from "@/features/audit-logs/audit-log.repository";
import { familyPaymentService } from "@/features/family-payments/family-payment.service";
import {
  createFamilyPaymentSchema,
  listFamilyPaymentsQuerySchema,
} from "@/features/family-payments/family-payment.validation";

export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const url = new URL(req.url);
  const parsed = listFamilyPaymentsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await familyPaymentService.list(parsed.data);
  return NextResponse.json(result);
});

// Cashier, Sebeka Gubae and Super Admin can record/approve payments
export const POST = withErrorHandling(async (req) => {
  const user = await requireRole("Super Admin", "Sebeka Gubae", "Cashier");
  const body = await req.json();
  const parsed = createFamilyPaymentSchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, parsed.error.issues.map((i) => i.message).join(" "));

  const payment = await familyPaymentService.create(parsed.data, { id: user.id, ...requestMetadata(req) });
  return NextResponse.json({ data: payment }, { status: 201 });
});
