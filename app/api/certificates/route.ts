import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { certificateService } from "@/features/certificates/certificate.service";
import { listCertificatesQuerySchema } from "@/features/certificates/certificate.validation";

export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const url = new URL(req.url);
  const parsed = listCertificatesQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await certificateService.list(parsed.data);
  return NextResponse.json(result);
});
