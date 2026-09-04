import { NextResponse } from "next/server";
import { requireRole, withErrorHandling } from "@/lib/api-helpers";
import { auditLogService } from "@/features/audit-logs/audit-log.service";

// GET /api/audit-logs?userId=&action=&entity=&status=&page=&limit=
export const GET = withErrorHandling(async (req) => {
  await requireRole("Super Admin");
  const url = new URL(req.url);
  const params = {
    page: Number(url.searchParams.get("page") ?? 1),
    limit: Number(url.searchParams.get("limit") ?? 10),
    userId: url.searchParams.get("userId") ?? undefined,
    action: url.searchParams.get("action") ?? undefined,
    entity: url.searchParams.get("entity") ?? undefined,
    status: (url.searchParams.get("status") as "Success" | "Failed" | null) ?? undefined,
  };

  const result = await auditLogService.list(params);
  return NextResponse.json(result);
});
