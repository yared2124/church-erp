import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { sacramentService } from "@/features/sacraments/sacrament.service";

// GET /api/sacraments/stats?type=Baptism
export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const type = new URL(req.url).searchParams.get("type");
  if (type !== "Baptism" && type !== "Marriage" && type !== "Burial") {
    throw new ApiError(400, "type must be Baptism, Marriage, or Burial.");
  }

  const [stats, priests] = await Promise.all([
    sacramentService.statsFor(type),
    sacramentService.priestOptions(type),
  ]);

  return NextResponse.json({ data: { ...stats, priests } });
});
