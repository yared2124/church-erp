import { NextResponse } from "next/server";
import { requireRole, withErrorHandling } from "@/lib/api-helpers";
import { userService } from "@/features/users/user.service";

export const GET = withErrorHandling(async () => {
  await requireRole("Super Admin");
  const stats = await userService.stats();
  return NextResponse.json({ data: stats });
});
