import { NextResponse } from "next/server";
import { auth } from "@/auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Verifies the request is authenticated. Every protected route handler
 * must call this first — never rely on the frontend hiding a button.
 * Throws ApiError(401) if there's no valid session.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, "Authentication required.");
  }
  if (session.user.status !== "Active") {
    throw new ApiError(403, "Your account is not active. Contact an administrator.");
  }
  return session.user;
}

/**
 * Verifies the authenticated user holds at least one of the given roles.
 * Use this for endpoints that only certain roles should reach — e.g. only
 * "Super Admin" or "Sebeka Gubae" can approve a financial transaction,
 * only "Super Admin" can manage Users & Roles or System Settings.
 * Throws ApiError(401) if unauthenticated, ApiError(403) if wrong role.
 */
export async function requireRole(...allowedRoles: string[]) {
  const user = await requireAuth();
  const hasRole = user.roles.some((r) => allowedRoles.includes(r));
  if (!hasRole) {
    throw new ApiError(
      403,
      `This action requires one of the following roles: ${allowedRoles.join(", ")}.`
    );
  }
  return user;
}

/**
 * Wraps a route handler body so ApiError instances become the right HTTP
 * response automatically, and anything unexpected becomes a safe 500
 * without leaking a stack trace to the client.
 */
export function withErrorHandling(
  handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>
) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[API ERROR]", err);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}
