import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSacramentDto } from './dto/create-sacrament.dto';
import { UpdateSacramentDto } from './dto/update-sacrament.dto';
import { QuerySacramentDto } from './dto/query-sacrament.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

const SACRAMENT_INCLUDE = {
  primaryMember: {
    select: { id: true, firstName: true, lastName: true, phone: true },
  },
  secondaryMember: {
    select: { id: true, firstName: true, lastName: true, phone: true },
  },
  family: {
    select: { id: true, name: true },
  },
  priest: {
    select: { id: true, name: true, email: true },
  },
  registeredBy: {
    select: { id: true, name: true, email: true },
  },
  sponsors: true,
} as const;

@Injectable()
export class SacramentsService {
  private readonly logger = new Logger(SacramentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: QuerySacramentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SacramentWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.priestId && { priestId: query.priestId }),
      ...(query.memberId && {
        OR: [
          { primaryMemberId: query.memberId },
          { secondaryMemberId: query.memberId },
        ],
      }),
      ...((query.startDate || query.endDate) && {
        date: {
          ...(query.startDate && { gte: query.startDate }),
          ...(query.endDate && { lte: query.endDate }),
        },
      }),
      ...(query.search && {
        OR: [
          {
            primaryMember: {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          },
          {
            secondaryMember: {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          },
          { church: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.sacrament.findMany({
        where,
        include: SACRAMENT_INCLUDE,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.sacrament.count({ where }),
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
    const sacrament = await this.prisma.sacrament.findUnique({
      where: { id },
      include: SACRAMENT_INCLUDE,
    });

    if (!sacrament) {
      throw new NotFoundException('Sacrament record not found.');
    }

    return sacrament;
  }

  async create(dto: CreateSacramentDto, actor: AuditActor) {
    // Validate primary member exists
    const primaryMember = await this.prisma.member.findUnique({
      where: { id: dto.primaryMemberId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!primaryMember) {
      throw new UnprocessableEntityException('Primary member not found.');
    }

    // For Marriage, a secondary member is required
    if (dto.type === 'Marriage' && !dto.secondaryMemberId) {
      throw new BadRequestException('Marriage sacrament requires a secondary member (Bride or Groom).');
    }

    if (dto.secondaryMemberId) {
      const secondaryMember = await this.prisma.member.findUnique({
        where: { id: dto.secondaryMemberId },
        select: { id: true },
      });
      if (!secondaryMember) {
        throw new UnprocessableEntityException('Secondary member not found.');
      }
      if (dto.secondaryMemberId === dto.primaryMemberId) {
        throw new BadRequestException('Primary and secondary members must be different people.');
      }
    }

    if (dto.familyId) {
      const family = await this.prisma.family.findUnique({ where: { id: dto.familyId } });
      if (!family) throw new UnprocessableEntityException('Family not found.');
    }

    const sacrament = await this.prisma.$transaction(async (tx) => {
      const created = await tx.sacrament.create({
        data: {
          type: dto.type,
          primaryMemberId: dto.primaryMemberId,
          secondaryMemberId: dto.secondaryMemberId,
          familyId: dto.familyId,
          date: dto.date,
          priestId: dto.priestId,
          church: dto.church ?? 'St. Mary Birhane Genet Church',
          notes: dto.notes?.trim() || null,
          registeredById: actor.id,
          sponsors: dto.sponsors?.length
            ? {
                create: dto.sponsors.map((s) => ({
                  name: s.name.trim(),
                  relation: s.relation.trim(),
                })),
              }
            : undefined,
        },
        include: SACRAMENT_INCLUDE,
      });

      return created;
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'Sacrament',
      entityId: sacrament.id,
      status: 'Success',
      description: `Registered ${dto.type} sacrament for ${primaryMember.firstName} ${primaryMember.lastName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return sacrament;
  }

  async update(id: string, dto: UpdateSacramentDto, actor: AuditActor) {
    const existing = await this.prisma.sacrament.findUnique({
      where: { id },
      include: { primaryMember: true },
    });

    if (!existing) {
      throw new NotFoundException('Sacrament record not found.');
    }

    const type = dto.type ?? existing.type;
    const secondaryMemberId = dto.secondaryMemberId !== undefined ? dto.secondaryMemberId : existing.secondaryMemberId;

    if (type === 'Marriage' && !secondaryMemberId) {
      throw new BadRequestException('Marriage sacrament requires a secondary member.');
    }

    const sacrament = await this.prisma.$transaction(async (tx) => {
      // Replace sponsors if provided in dto
      if (dto.sponsors !== undefined) {
        await tx.sacramentSponsor.deleteMany({ where: { sacramentId: id } });
      }

      const updated = await tx.sacrament.update({
        where: { id },
        data: {
          ...(dto.type && { type: dto.type }),
          ...(dto.primaryMemberId && { primaryMemberId: dto.primaryMemberId }),
          ...(dto.secondaryMemberId !== undefined && { secondaryMemberId: dto.secondaryMemberId }),
          ...(dto.familyId !== undefined && { familyId: dto.familyId }),
          ...(dto.date && { date: dto.date }),
          ...(dto.priestId !== undefined && { priestId: dto.priestId }),
          ...(dto.church !== undefined && { church: dto.church }),
          ...(dto.status && { status: dto.status }),
          ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
          ...(dto.sponsors !== undefined && dto.sponsors.length > 0 && {
            sponsors: {
              create: dto.sponsors.map((s) => ({
                name: s.name.trim(),
                relation: s.relation.trim(),
              })),
            },
          }),
        },
        include: SACRAMENT_INCLUDE,
      });

      return updated;
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'Sacrament',
      entityId: id,
      status: 'Success',
      description: `Updated ${existing.type} sacrament for ${existing.primaryMember.firstName} ${existing.primaryMember.lastName}${dto.status ? ` → ${dto.status}` : ''}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return sacrament;
  }

  async stats() {
    const [total, byType, byStatus] = await Promise.all([
      this.prisma.sacrament.count(),
      this.prisma.sacrament.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
      this.prisma.sacrament.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      byType: byType.map((r) => ({ type: r.type, count: r._count._all })),
      byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
    };
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
