import { NextResponse } from "next/server";
import { requireAuth, requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { requestMetadata } from "@/features/audit-logs/audit-log.repository";
import { familyService } from "@/features/families/family.service";
import { createFamilySchema, listFamiliesQuerySchema } from "@/features/families/family.validation";

export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const url = new URL(req.url);
  const parsed = listFamiliesQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await familyService.list(parsed.data);
  return NextResponse.json(result);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireRole("Super Admin", "Registrar");
  const body = await req.json();
  const parsed = createFamilySchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, parsed.error.issues.map((i) => i.message).join(" "));

  const family = await familyService.create(parsed.data, { id: user.id, ...requestMetadata(req) });
  return NextResponse.json({ data: family }, { status: 201 });
});
