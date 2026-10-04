import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateRequestDto } from './dto/create-certificate-request.dto';
import { UpdateCertificateRequestDto, CertificateStatusEnum } from './dto/update-certificate-request.dto';
import { QueryCertificateRequestDto } from './dto/query-certificate-request.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

const CERT_INCLUDE = {
  member: {
    select: { id: true, firstName: true, lastName: true, phone: true, email: true },
  },
  requestedBy: {
    select: { id: true, name: true, email: true },
  },
} as const;

// Define valid status transitions to enforce workflow integrity
const VALID_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['Issued', 'Rejected'],
  Rejected: ['Pending'], // Allow re-submission
  Issued: [], // Terminal state — no further transitions
};

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryCertificateRequestDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CertificateRequestWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.memberId && { memberId: query.memberId }),
      ...(query.search && {
        OR: [
          {
            member: {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          },
          { purpose: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.certificateRequest.findMany({
        where,
        include: CERT_INCLUDE,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.certificateRequest.count({ where }),
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
    const cert = await this.prisma.certificateRequest.findUnique({
      where: { id },
      include: CERT_INCLUDE,
    });

    if (!cert) {
      throw new NotFoundException('Certificate request not found.');
    }

    return cert;
  }

  async create(dto: CreateCertificateRequestDto, actor: AuditActor) {
    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!member) {
      throw new UnprocessableEntityException('Member not found.');
    }

    const certRequest = await this.prisma.certificateRequest.create({
      data: {
        memberId: dto.memberId,
        type: dto.type,
        requestedById: actor.id,
        status: 'Pending',
        purpose: dto.purpose?.trim() || null,
        notes: dto.notes?.trim() || null,
      },
      include: CERT_INCLUDE,
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'CertificateRequest',
      entityId: certRequest.id,
      status: 'Success',
      description: `Submitted ${dto.type} certificate request for ${member.firstName} ${member.lastName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return certRequest;
  }

  async updateStatus(id: string, dto: UpdateCertificateRequestDto, actor: AuditActor) {
    const existing = await this.prisma.certificateRequest.findUnique({
      where: { id },
      include: { member: { select: { firstName: true, lastName: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Certificate request not found.');
    }

    // Enforce workflow state machine if status is being changed
    if (dto.status && dto.status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition certificate status from "${existing.status}" to "${dto.status}". ` +
          `Allowed transitions: [${allowed.join(', ') || 'none'}].`,
        );
      }
    }

    const updated = await this.prisma.certificateRequest.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.purpose !== undefined && { purpose: dto.purpose?.trim() || null }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
      },
      include: CERT_INCLUDE,
    });

    const statusChange = dto.status ? ` → ${dto.status}` : '';
    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'CertificateRequest',
      entityId: id,
      status: 'Success',
      description: `Updated ${existing.type} certificate request for ${existing.member.firstName} ${existing.member.lastName}${statusChange}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async stats() {
    const [total, byType, byStatus] = await Promise.all([
      this.prisma.certificateRequest.count(),
      this.prisma.certificateRequest.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
      this.prisma.certificateRequest.groupBy({
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
