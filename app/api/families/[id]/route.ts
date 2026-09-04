import { NextResponse } from "next/server";
import { requireAuth, requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { requestMetadata } from "@/features/audit-logs/audit-log.repository";
import { familyService } from "@/features/families/family.service";
import { updateFamilySchema } from "@/features/families/family.validation";

export const GET = withErrorHandling(async (_req, { params }) => {
  await requireAuth();
  const { id } = await params;
  const family = await familyService.getById(id);
  return NextResponse.json({ data: family });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  const user = await requireRole("Super Admin", "Registrar");
  const { id } = await params;
  const body = await req.json();
  const parsed = updateFamilySchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, parsed.error.issues.map((i) => i.message).join(" "));

  const family = await familyService.update(id, parsed.data, { id: user.id, ...requestMetadata(req) });
  return NextResponse.json({ data: family });
});

export const DELETE = withErrorHandling(async (req, { params }) => {
  const user = await requireRole("Super Admin", "Registrar");
  const { id } = await params;
  await familyService.archive(id, { id: user.id, ...requestMetadata(req) });
  return new NextResponse(null, { status: 204 });
});
