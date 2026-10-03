import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { QueryFamilyDto } from './dto/query-family.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class FamiliesService {
  private readonly logger = new Logger(FamiliesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryFamilyDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.FamilyWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.sebekaStatus && { sebekaStatus: query.sebekaStatus }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.family.findMany({
        where,
        include: {
          members: true,
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.family.count({ where }),
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
    const family = await this.prisma.family.findUnique({
      where: { id },
      include: {
        members: true,
        familyPayments: { orderBy: { year: 'desc' } },
      },
    });

    if (!family) {
      throw new NotFoundException('Family not found.');
    }

    return family;
  }

  async create(dto: CreateFamilyDto, actor: AuditActor) {
    const family = await this.prisma.family.create({
      data: {
        name: dto.name.trim(),
        address: dto.address?.trim() || null,
        phone: dto.phone?.trim() || null,
        registrationDate: dto.registrationDate ?? new Date(),
        status: dto.status ?? 'Active',
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'Family',
      entityId: family.id,
      status: 'Success',
      description: `Created family ${family.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return family;
  }

  async update(id: string, dto: UpdateFamilyDto, actor: AuditActor) {
    const existing = await this.prisma.family.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Family not found.');
    }

    const family = await this.prisma.family.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.address !== undefined && { address: dto.address?.trim() || null }),
        ...(dto.phone !== undefined && { phone: dto.phone?.trim() || null }),
        ...(dto.registrationDate && { registrationDate: dto.registrationDate }),
        ...(dto.status && { status: dto.status }),
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'Family',
      entityId: family.id,
      status: 'Success',
      description: `Updated family ${family.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return family;
  }

  async archive(id: string, actor: AuditActor) {
    const existing = await this.prisma.family.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Family not found.');
    }

    const activeMembersCount = await this.prisma.member.count({
      where: { familyId: id, status: { not: 'Inactive' } },
    });

    if (activeMembersCount > 0) {
      throw new ConflictException(
        'This family still has active members. Reassign or archive its members first.',
      );
    }

    const family = await this.prisma.family.update({
      where: { id },
      data: { status: 'Inactive' },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'Family',
      entityId: id,
      status: 'Success',
      description: `Archived family ${existing.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return family;
  }

  async stats() {
    const [total, active, outstanding, sebekaBreakdownRows, families] = await Promise.all([
      this.prisma.family.count(),
      this.prisma.family.count({ where: { status: 'Active' } }),
      this.prisma.family.count({ where: { sebekaStatus: { not: 'Paid' } } }),
      this.prisma.family.groupBy({ by: ['sebekaStatus'], _count: true }),
      this.prisma.family.findMany({ select: { registrationDate: true } }),
    ]);

    const sebekaBreakdown = sebekaBreakdownRows.map((r) => ({
      status: r.sebekaStatus,
      count: r._count,
    }));

    const byYearMap = new Map<number, number>();
    for (const f of families) {
      const year = f.registrationDate.getFullYear();
      byYearMap.set(year, (byYearMap.get(year) ?? 0) + 1);
    }

    const byYear = Array.from(byYearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({ year: String(year), count }));

    return { total, active, outstanding, sebekaBreakdown, byYear };
  }

  private async recordAudit(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    status: 'Success' | 'Failed';
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          status: data.status,
          description: data.description,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (err) {
      this.logger.error(`Audit log creation failed: ${(err as Error).message}`);
    }
  }
}
