import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { inventoryService } from "@/features/inventory/inventory.service";
import { listInventoryQuerySchema } from "@/features/inventory/inventory.validation";

export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const url = new URL(req.url);
  const parsed = listInventoryQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await inventoryService.list(parsed.data);
  return NextResponse.json(result);
});
