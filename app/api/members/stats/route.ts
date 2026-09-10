import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling } from "@/lib/api-helpers";
import { memberService } from "@/features/members/member.service";

// GET /api/members/stats — backs the KPI cards, gender donut, age bar chart,
// and Recent Members card on the Members overview page.
export const GET = withErrorHandling(async () => {
  const user = await requireAuth();
  const isPriest = user.roles.includes("Priest") && !user.roles.includes("Super Admin");
  const priestId = isPriest ? user.id : undefined;

  const [stats, genderBreakdown, ageBreakdown, recent] = await Promise.all([
    memberService.stats(priestId),
    memberService.genderBreakdown(priestId),
    memberService.ageBreakdown(priestId),
    memberService.recent(4, priestId),
  ]);

  return NextResponse.json({
    data: { ...stats, genderBreakdown, ageBreakdown, recent },
  });
});
