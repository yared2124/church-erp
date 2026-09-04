import { NextResponse } from "next/server";
import { requireAuth, requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { requestMetadata } from "@/features/audit-logs/audit-log.repository";
import { familyPaymentService } from "@/features/family-payments/family-payment.service";
import { updateFamilyPaymentSchema } from "@/features/family-payments/family-payment.validation";

export const GET = withErrorHandling(async (_req, { params }) => {
  await requireAuth();
  const { id } = await params;
  const payment = await familyPaymentService.getById(id);
  return NextResponse.json({ data: payment });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  const user = await requireRole("Super Admin", "Sebeka Gubae");
  const { id } = await params;
  const body = await req.json();
  const parsed = updateFamilyPaymentSchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, parsed.error.issues.map((i) => i.message).join(" "));

  const payment = await familyPaymentService.update(id, parsed.data, { id: user.id, ...requestMetadata(req) });
  return NextResponse.json({ data: payment });
});
