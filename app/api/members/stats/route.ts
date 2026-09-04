import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling } from "@/lib/api-helpers";
import { memberService } from "@/features/members/member.service";

// GET /api/members/stats — backs the KPI cards, gender donut, age bar chart,
// and Recent Members card on the Members overview page.
export const GET = withErrorHandling(async () => {
  await requireAuth();

  const [stats, genderBreakdown, ageBreakdown, recent] = await Promise.all([
    memberService.stats(),
    memberService.genderBreakdown(),
    memberService.ageBreakdown(),
    memberService.recent(4),
  ]);

  return NextResponse.json({
    data: { ...stats, genderBreakdown, ageBreakdown, recent },
  });
});
