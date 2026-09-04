import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling } from "@/lib/api-helpers";
import { familyService } from "@/features/families/family.service";

export const GET = withErrorHandling(async () => {
  await requireAuth();
  const stats = await familyService.stats();
  return NextResponse.json({ data: stats });
});
