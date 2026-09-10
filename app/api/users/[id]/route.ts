import { NextResponse } from "next/server";
import { requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { userService } from "@/features/users/user.service";
import { updateUserSchema } from "@/features/users/user.validation";

export const GET = withErrorHandling(async (_req, ctx) => {
  await requireRole("Super Admin");
  const { id } = await ctx.params;
  const user = await userService.getById(id);
  return NextResponse.json({ data: user });
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  const actor = await requireRole("Super Admin");
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));
  }

  const updated = await userService.update(id, parsed.data, {
    id: actor.id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ data: updated });
});

export const DELETE = withErrorHandling(async (req, ctx) => {
  const actor = await requireRole("Super Admin");
  const { id } = await ctx.params;
  const result = await userService.delete(id, {
    id: actor.id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ data: result });
});
