import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface AuditLogInput {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  status: "Success" | "Failed";
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, unknown>;
}

/**
 * Insert-only. No update/delete method exists here on purpose — no route
 * handler anywhere should be able to modify audit history. If a write
 * fails, we log it to the server console rather than letting an audit
 * logging failure roll back the actual business transaction.
 */
export const auditLogRepository = {
  async record(input: AuditLogInput) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          status: input.status,
          description: input.description,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          changes: input.changes ? (input.changes as unknown as Prisma.InputJsonValue) : undefined,
        },
      });
    } catch (err) {
      console.error("[AUDIT LOG WRITE FAILED]", err);
    }
  },

  async list(params: { page: number; limit: number; userId?: string; action?: string; entity?: string; status?: "Success" | "Failed" }) {
    const where = {
      ...(params.userId && { userId: params.userId }),
      ...(params.action && { action: params.action }),
      ...(params.entity && { entity: params.entity }),
      ...(params.status && { status: params.status }),
    };
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, total };
  },

  async stats() {
    const [totalEvents, successfulEvents, failedEvents, users, entities] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { status: "Success" } }),
      prisma.auditLog.count({ where: { status: "Failed" } }),
      prisma.auditLog.findMany({ distinct: ["userId"], select: { userId: true } }),
      prisma.auditLog.findMany({ distinct: ["entityId"], select: { entityId: true } }),
    ]);
    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      uniqueUsers: users.length,
      entitiesAffected: entities.length,
    };
  },

  filterOptions() {
    return Promise.all([
      prisma.user.findMany({ select: { id: true, name: true } }),
      prisma.auditLog.findMany({ distinct: ["action"], select: { action: true } }),
      prisma.auditLog.findMany({ distinct: ["entity"], select: { entity: true } }),
    ]);
  },
};

/** Helper for route handlers to pull IP/UA off the request for audit entries. */
export function requestMetadata(req: Request) {
  return {
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  };
}
