import { NextResponse } from "next/server";
import { requireAuth, requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { requestMetadata } from "@/features/audit-logs/audit-log.repository";
import { memberService } from "@/features/members/member.service";
import { updateMemberSchema } from "@/features/members/member.validation";

// GET /api/members/:id
export const GET = withErrorHandling(async (_req, { params }) => {
  await requireAuth();
  const { id } = await params;
  const member = await memberService.getById(id);
  return NextResponse.json({ data: member });
});

// PATCH /api/members/:id
export const PATCH = withErrorHandling(async (req, { params }) => {
  const user = await requireRole("Super Admin", "Registrar");
  const { id } = await params;

  const body = await req.json();
  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(422, parsed.error.issues.map((i) => i.message).join(" "));
  }

  const member = await memberService.update(id, parsed.data, { id: user.id, ...requestMetadata(req) });
  return NextResponse.json({ data: member });
});

// DELETE /api/members/:id — soft delete (status → Inactive), never a hard delete.
export const DELETE = withErrorHandling(async (req, { params }) => {
  const user = await requireRole("Super Admin", "Registrar");
  const { id } = await params;

  await memberService.archive(id, { id: user.id, ...requestMetadata(req) });
  return new NextResponse(null, { status: 204 });
});
