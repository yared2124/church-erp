import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { sacramentService } from "@/features/sacraments/sacrament.service";
import { listSacramentsQuerySchema } from "@/features/sacraments/sacrament.validation";

// GET /api/sacraments?type=Baptism&search=&status=&priestId=&page=&limit=
export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const url = new URL(req.url);
  const parsed = listSacramentsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await sacramentService.list(parsed.data);
  return NextResponse.json(result);
});
