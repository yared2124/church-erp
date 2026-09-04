import { NextResponse } from "next/server";
import { requireAuth, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { employeeService } from "@/features/employees/employee.service";
import { listEmployeesQuerySchema } from "@/features/employees/employee.validation";

export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const url = new URL(req.url);
  const parsed = listEmployeesQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(" "));

  const result = await employeeService.list(parsed.data);
  return NextResponse.json(result);
});
