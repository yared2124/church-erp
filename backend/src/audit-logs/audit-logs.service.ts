import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryAuditLogDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      ...(query.userId && { userId: query.userId }),
      ...(query.action && { action: query.action }),
      ...(query.entity && { entity: query.entity }),
      ...(query.status && { status: query.status as AuditStatus }),
      ...(query.search && {
        OR: [
          { description: { contains: query.search, mode: 'insensitive' } },
          { entityId: { contains: query.search, mode: 'insensitive' } },
          { ipAddress: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getById(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!log) {
      throw new NotFoundException('Audit log record not found.');
    }

    return log;
  }

  async stats() {
    const [totalEvents, successfulEvents, failedEvents, users, entities] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({ where: { status: 'Success' } }),
      this.prisma.auditLog.count({ where: { status: 'Failed' } }),
      this.prisma.auditLog.findMany({ distinct: ['userId'], select: { userId: true } }),
      this.prisma.auditLog.findMany({ distinct: ['entityId'], select: { entityId: true } }),
    ]);

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      uniqueUsers: users.length,
      entitiesAffected: entities.length,
    };
  }

  async filterOptions() {
    const [users, actionRows, entityRows] = await Promise.all([
      this.prisma.user.findMany({ select: { id: true, name: true, email: true } }),
      this.prisma.auditLog.findMany({ distinct: ['action'], select: { action: true } }),
      this.prisma.auditLog.findMany({ distinct: ['entity'], select: { entity: true } }),
    ]);

    return {
      users,
      actions: actionRows.map((a) => a.action),
      entities: entityRows.map((e) => e.entity),
    };
  }
}
