import { NextResponse } from "next/server";
import { requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { userService } from "@/features/users/user.service";
import { listUsersQuerySchema } from "@/features/users/user.validation";

export const GET = withErrorHandling(async (req) => {
  await requireRole("Super Admin");
  const url = new URL(req.url);
  const parsed = listUsersQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await userService.list(parsed.data);
  return NextResponse.json(result);
});
