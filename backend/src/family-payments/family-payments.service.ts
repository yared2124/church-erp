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
import { CreateFamilyPaymentDto } from './dto/create-family-payment.dto';
import { UpdateFamilyPaymentDto } from './dto/update-family-payment.dto';
import { QueryFamilyPaymentDto } from './dto/query-family-payment.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

const OVERDUE_CUTOFF_DAYS = 60;

function isOverdue(year: number): boolean {
  const yearEnd = new Date(year, 11, 31);
  const daysSinceYearEnd = (Date.now() - yearEnd.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceYearEnd > OVERDUE_CUTOFF_DAYS;
}

function derivePaymentStatus(
  expected: number,
  paid: number,
  overdue: boolean,
): 'Paid' | 'Partial' | 'Unpaid' | 'Overdue' {
  if (paid >= expected && expected > 0) return 'Paid';
  if (paid > 0) return 'Partial';
  return overdue ? 'Overdue' : 'Unpaid';
}

@Injectable()
export class FamilyPaymentsService {
  private readonly logger = new Logger(FamilyPaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryFamilyPaymentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.FamilyPaymentWhereInput = {
      ...(query.year && { year: query.year }),
      ...(query.status && { status: query.status }),
      ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
      ...(query.search && {
        OR: [
          { receiptNumber: { contains: query.search, mode: 'insensitive' } },
          { family: { name: { contains: query.search, mode: 'insensitive' } } },
          { family: { phone: { contains: query.search } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.familyPayment.findMany({
        where,
        include: {
          family: true,
          recordedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.familyPayment.count({ where }),
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
    const payment = await this.prisma.familyPayment.findUnique({
      where: { id },
      include: {
        family: true,
        recordedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found.');
    }

    return payment;
  }

  async create(dto: CreateFamilyPaymentDto, actor: AuditActor) {
    if (dto.paidAmount > dto.expectedAmount) {
      throw new BadRequestException('Paid amount cannot exceed expected amount.');
    }

    const family = await this.prisma.family.findUnique({
      where: { id: dto.familyId },
      select: { id: true, name: true },
    });

    if (!family) {
      throw new UnprocessableEntityException('The selected family does not exist.');
    }

    const existing = await this.prisma.familyPayment.findUnique({
      where: {
        familyId_year: {
          familyId: dto.familyId,
          year: dto.year,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `A payment record for this family and year ${dto.year} already exists. Edit it instead.`,
      );
    }

    const status = derivePaymentStatus(
      dto.expectedAmount,
      dto.paidAmount,
      isOverdue(dto.year),
    );

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.familyPayment.create({
        data: {
          familyId: dto.familyId,
          year: dto.year,
          expectedAmount: dto.expectedAmount,
          paidAmount: dto.paidAmount,
          paymentDate: dto.paymentDate ?? new Date(),
          paymentMethod: dto.paymentMethod,
          receiptNumber: dto.receiptNumber.trim(),
          receiptUrl: dto.receiptUrl?.trim() || null,
          notes: dto.notes?.trim() || null,
          recordedById: actor.id,
          status,
        },
        include: {
          family: true,
          recordedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.family.update({
        where: { id: dto.familyId },
        data: { sebekaStatus: status },
      });

      return created;
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'FamilyPayment',
      entityId: payment.id,
      status: 'Success',
      description: `Recorded ${dto.year} Sebeka payment (Receipt #${payment.receiptNumber}) for family ${family.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return payment;
  }

  async update(id: string, dto: UpdateFamilyPaymentDto, actor: AuditActor) {
    const existing = await this.prisma.familyPayment.findUnique({
      where: { id },
      include: { family: true },
    });

    if (!existing) {
      throw new NotFoundException('Payment record not found.');
    }

    const expectedAmount =
      dto.expectedAmount !== undefined ? dto.expectedAmount : Number(existing.expectedAmount);
    const paidAmount =
      dto.paidAmount !== undefined ? dto.paidAmount : Number(existing.paidAmount);

    if (paidAmount > expectedAmount) {
      throw new BadRequestException('Paid amount cannot exceed expected amount.');
    }

    const status = derivePaymentStatus(
      expectedAmount,
      paidAmount,
      isOverdue(existing.year),
    );

    const payment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.familyPayment.update({
        where: { id },
        data: {
          ...(dto.expectedAmount !== undefined && { expectedAmount: dto.expectedAmount }),
          ...(dto.paidAmount !== undefined && { paidAmount: dto.paidAmount }),
          ...(dto.paymentDate && { paymentDate: dto.paymentDate }),
          ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
          ...(dto.receiptNumber !== undefined && { receiptNumber: dto.receiptNumber.trim() }),
          ...(dto.receiptUrl !== undefined && { receiptUrl: dto.receiptUrl?.trim() || null }),
          ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
          status,
        },
        include: {
          family: true,
          recordedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.family.update({
        where: { id: existing.familyId },
        data: { sebekaStatus: status },
      });

      return updated;
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'FamilyPayment',
      entityId: payment.id,
      status: 'Success',
      description: `Updated ${payment.year} Sebeka payment for family ${existing.family.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return payment;
  }

  async stats() {
    const rows = await this.prisma.familyPayment.findMany({
      select: { expectedAmount: true, paidAmount: true, status: true },
    });

    const totalCollected = rows.reduce(
      (sum, r) => sum + Number(r.paidAmount),
      0,
    );
    const expected = rows.reduce(
      (sum, r) => sum + Number(r.expectedAmount),
      0,
    );
    const familiesPaid = rows.filter((r) => r.status === 'Paid').length;
    const familiesUnpaid = rows.filter(
      (r) => r.status === 'Unpaid' || r.status === 'Overdue',
    ).length;

    return {
      totalCollected,
      expected,
      outstanding: expected - totalCollected,
      familiesPaid,
      familiesUnpaid,
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
