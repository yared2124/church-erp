import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryMemberDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MemberWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.roleInFamily && { roleInFamily: query.roleInFamily }),
      ...(query.familyId && { familyId: query.familyId }),
      ...(query.confessorPriestId && { confessorPriestId: query.confessorPriestId }),
      ...(query.sebekaStatus && { family: { sebekaStatus: query.sebekaStatus } }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { middleName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        include: {
          family: true,
          confessorPriest: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.member.count({ where }),
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
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        family: true,
        confessorPriest: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found.');
    }

    return member;
  }

  async create(dto: CreateMemberDto, actor: AuditActor) {
    const family = await this.prisma.family.findUnique({
      where: { id: dto.familyId },
      select: { id: true },
    });

    if (!family) {
      throw new UnprocessableEntityException('The selected family does not exist.');
    }

    const member = await this.prisma.member.create({
      data: {
        familyId: dto.familyId,
        firstName: dto.firstName.trim(),
        middleName: dto.middleName?.trim() || null,
        lastName: dto.lastName.trim(),
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth,
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim() || null,
        address: dto.address?.trim() || null,
        roleInFamily: dto.roleInFamily,
        status: dto.status ?? 'Active',
        confessorPriestId: dto.confessorPriestId || null,
        baptizedDate: dto.baptizedDate,
        membershipDate: dto.membershipDate ?? new Date(),
      },
      include: { family: true },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'Member',
      entityId: member.id,
      status: 'Success',
      description: `Created member ${member.firstName} ${member.lastName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return member;
  }

  async update(id: string, dto: UpdateMemberDto, actor: AuditActor) {
    const existing = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Member not found.');
    }

    if (dto.familyId) {
      const family = await this.prisma.family.findUnique({
        where: { id: dto.familyId },
        select: { id: true },
      });
      if (!family) {
        throw new UnprocessableEntityException('The selected family does not exist.');
      }
    }

    const member = await this.prisma.member.update({
      where: { id },
      data: {
        ...(dto.familyId && { familyId: dto.familyId }),
        ...(dto.firstName && { firstName: dto.firstName.trim() }),
        ...(dto.middleName !== undefined && { middleName: dto.middleName?.trim() || null }),
        ...(dto.lastName && { lastName: dto.lastName.trim() }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.dateOfBirth && { dateOfBirth: dto.dateOfBirth }),
        ...(dto.phone !== undefined && { phone: dto.phone?.trim() || null }),
        ...(dto.email !== undefined && { email: dto.email?.trim() || null }),
        ...(dto.address !== undefined && { address: dto.address?.trim() || null }),
        ...(dto.roleInFamily && { roleInFamily: dto.roleInFamily }),
        ...(dto.status && { status: dto.status }),
        ...(dto.confessorPriestId !== undefined && {
          confessorPriestId: dto.confessorPriestId || null,
        }),
        ...(dto.baptizedDate && { baptizedDate: dto.baptizedDate }),
        ...(dto.membershipDate && { membershipDate: dto.membershipDate }),
      },
      include: { family: true },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'Member',
      entityId: member.id,
      status: 'Success',
      description: `Updated member ${member.firstName} ${member.lastName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return member;
  }

  async archive(id: string, actor: AuditActor) {
    const existing = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Member not found.');
    }

    const member = await this.prisma.member.update({
      where: { id },
      data: { status: 'Inactive' },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'Member',
      entityId: id,
      status: 'Success',
      description: `Archived (soft-deleted) member ${existing.firstName} ${existing.lastName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return member;
  }

  async stats(priestId?: string) {
    const filter: Prisma.MemberWhereInput = priestId ? { confessorPriestId: priestId } : {};
    const [total, active, inactive, newThisMonth, sebekaPaid, sebekaUnpaid] = await Promise.all([
      this.prisma.member.count({ where: filter }),
      this.prisma.member.count({ where: { ...filter, status: 'Active' } }),
      this.prisma.member.count({ where: { ...filter, status: 'Inactive' } }),
      this.prisma.member.count({
        where: {
          ...filter,
          membershipDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.member.count({
        where: { ...filter, family: { sebekaStatus: 'Paid' } },
      }),
      this.prisma.member.count({
        where: { ...filter, family: { sebekaStatus: { not: 'Paid' } } },
      }),
    ]);

    return { total, active, inactive, newThisMonth, sebekaPaid, sebekaUnpaid };
  }

  async genderBreakdown(priestId?: string) {
    const where: Prisma.MemberWhereInput | undefined = priestId
      ? { confessorPriestId: priestId }
      : undefined;

    const rows = await this.prisma.member.groupBy({
      by: ['gender'],
      where,
      _count: true,
    });

    return rows.map((r) => ({
      gender: r.gender,
      count: r._count,
    }));
  }

  async ageBreakdown(priestId?: string) {
    const where: Prisma.MemberWhereInput | undefined = priestId
      ? { confessorPriestId: priestId }
      : undefined;

    const rows = await this.prisma.member.findMany({
      where,
      select: { dateOfBirth: true },
    });

    const buckets: Record<string, number> = {
      '0-17': 0,
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      '60+': 0,
    };

    const now = Date.now();
    for (const { dateOfBirth } of rows) {
      const age = (now - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) buckets['0-17']++;
      else if (age < 31) buckets['18-30']++;
      else if (age < 46) buckets['31-45']++;
      else if (age < 61) buckets['46-60']++;
      else buckets['60+']++;
    }

    return Object.entries(buckets).map(([group, count]) => ({ group, count }));
  }

  async recent(limit: number, priestId?: string) {
    const where: Prisma.MemberWhereInput | undefined = priestId
      ? { confessorPriestId: priestId }
      : undefined;

    return this.prisma.member.findMany({
      where,
      orderBy: { membershipDate: 'desc' },
      take: limit,
      include: {
        family: true,
        confessorPriest: {
          select: { id: true, name: true },
        },
      },
    });
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
