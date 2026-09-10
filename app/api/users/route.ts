import { NextResponse } from "next/server";
import { requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { userService } from "@/features/users/user.service";
import { listUsersQuerySchema, createUserSchema } from "@/features/users/user.validation";

export const GET = withErrorHandling(async (req) => {
  await requireRole("Super Admin");
  const url = new URL(req.url);
  const parsed = listUsersQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await userService.list(parsed.data);
  return NextResponse.json(result);
});

export const POST = withErrorHandling(async (req) => {
  const actor = await requireRole("Super Admin");
  const body = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));
  }

  const user = await userService.create(parsed.data, {
    id: actor.id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ data: user }, { status: 201 });
});
