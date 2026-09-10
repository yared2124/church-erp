import { NextResponse } from "next/server";
import { requireAuth, requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { requestMetadata } from "@/features/audit-logs/audit-log.repository";
import { memberService } from "@/features/members/member.service";
import { createMemberSchema, listMembersQuerySchema } from "@/features/members/member.validation";

// GET /api/members?search=&status=&roleInFamily=&familyId=&page=&limit=
export const GET = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const isPriest = user.roles.includes("Priest") && !user.roles.includes("Super Admin");

  const url = new URL(req.url);
  const parsed = listMembersQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));
  }

  const query = {
    ...parsed.data,
    ...(isPriest ? { confessorPriestId: user.id } : {}),
  };

  const result = await memberService.list(query);
  return NextResponse.json(result);
});

// POST /api/members — create a new member
export const POST = withErrorHandling(async (req) => {
  // Only Super Admins may create members.
  const user = await requireRole("Super Admin");

  const body = await req.json();
  const parsed = createMemberSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(422, parsed.error.issues.map((i) => i.message).join(" "));
  }

  const member = await memberService.create(parsed.data, { id: user.id, ...requestMetadata(req) });
  return NextResponse.json({ data: member }, { status: 201 });
});
