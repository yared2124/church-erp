import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryUserDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.role && { roles: { some: { role: { name: query.role } } } }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [rawUsers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = rawUsers.map((u) => this.sanitizeUser(u));

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
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.sanitizeUser(user);
  }

  async create(dto: CreateUserDto, actor: AuditActor) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('A user with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      let roleRecord = await tx.role.findUnique({ where: { name: dto.role } });
      if (!roleRecord) {
        roleRecord = await tx.role.create({ data: { name: dto.role } });
      }

      const created = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          phone: dto.phone?.trim() ?? null,
          status: dto.status ?? 'Active',
        },
      });

      await tx.userRole.create({
        data: {
          userId: created.id,
          roleId: roleRecord.id,
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      status: 'Success',
      description: `Created user ${user.name} (${user.email}) with role ${dto.role}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return this.sanitizeUser(user);
  }

  async update(id: string, dto: UpdateUserDto, actor: AuditActor) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('User not found.');
    }

    if (dto.email && dto.email.toLowerCase().trim() !== existing.email.toLowerCase()) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (emailTaken && emailTaken.id !== id) {
        throw new ConflictException('A user with this email address already exists.');
      }
    }

    let passwordHash: string | undefined;
    if (dto.password && dto.password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(dto.password.trim(), 10);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.role) {
        let roleRecord = await tx.role.findUnique({ where: { name: dto.role } });
        if (!roleRecord) {
          roleRecord = await tx.role.create({ data: { name: dto.role } });
        }
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.create({
          data: {
            userId: id,
            roleId: roleRecord.id,
          },
        });
      }

      await tx.user.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name.trim() }),
          ...(dto.email && { email: dto.email.toLowerCase().trim() }),
          ...(passwordHash && { passwordHash }),
          ...(dto.phone !== undefined && { phone: dto.phone?.trim() ?? null }),
          ...(dto.status && { status: dto.status }),
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      status: 'Success',
      description: `Updated user ${updated.name} (${updated.email})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return this.sanitizeUser(updated);
  }

  async delete(id: string, actor: AuditActor) {
    if (id === actor.id) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('User not found.');
    }

    const [txCount, sacramentCount, certCount] = await Promise.all([
      this.prisma.transaction.count({ where: { createdById: id } }),
      this.prisma.sacrament.count({
        where: { OR: [{ registeredById: id }, { priestId: id }] },
      }),
      this.prisma.certificateRequest.count({ where: { requestedById: id } }),
    ]);

    if (txCount > 0 || sacramentCount > 0 || certCount > 0) {
      await this.prisma.user.update({
        where: { id },
        data: { status: 'Inactive' },
      });

      await this.recordAudit({
        userId: actor.id,
        action: 'DEACTIVATE',
        entity: 'User',
        entityId: id,
        status: 'Success',
        description: `Deactivated user ${existing.name} (${existing.email}) due to linked historical records`,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      });

      return {
        deleted: false,
        reason:
          'User has linked historical records (transactions, sacraments, or certificates). The account has been deactivated instead.',
      };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
      status: 'Success',
      description: `Permanently deleted user ${existing.name} (${existing.email})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { deleted: true };
  }

  async stats() {
    const [total, active, inactive, locked] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'Active' } }),
      this.prisma.user.count({ where: { status: 'Inactive' } }),
      this.prisma.user.count({ where: { status: 'Locked' } }),
    ]);

    return { total, active, inactive, locked };
  }

  async rolesSummary() {
    const roles = await this.prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
        permissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      users: r._count.users,
      permissions: r.permissions.map((p) => p.permission.key),
    }));
  }

  private sanitizeUser<T extends { passwordHash?: string | null }>(user: T): Omit<T, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
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
