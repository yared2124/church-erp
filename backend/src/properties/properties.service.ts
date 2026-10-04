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
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/create-maintenance.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

const PROPERTY_INCLUDE = {
  leaseAgreements: {
    where: { status: 'Active' as const },
    include: {
      tenant: true,
      rentPayments: {
        orderBy: { createdAt: 'desc' as const },
        take: 3,
      },
    },
  },
  maintenanceRequests: {
    where: { status: { not: 'Completed' as const } },
    orderBy: { createdAt: 'desc' as const },
    take: 3,
  },
} as const;

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // Properties CRUD
  // ==========================================

  async list(query: QueryPropertyDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        unitName: { contains: query.search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: PROPERTY_INCLUDE,
        orderBy: [{ unitName: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.property.count({ where }),
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
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        leaseAgreements: {
          include: {
            tenant: true,
            rentPayments: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { startDate: 'desc' },
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    return property;
  }

  async create(dto: CreatePropertyDto, actor: AuditActor) {
    const existing = await this.prisma.property.findFirst({
      where: { unitName: { equals: dto.unitName.trim(), mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(`Property with unit name "${dto.unitName}" already exists.`);
    }

    const property = await this.prisma.property.create({
      data: {
        unitName: dto.unitName.trim(),
        type: dto.type,
        monthlyRent: new Prisma.Decimal(dto.monthlyRent),
        status: dto.status ?? 'Vacant',
      },
      include: PROPERTY_INCLUDE,
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'Property',
      entityId: property.id,
      status: 'Success',
      description: `Created property unit ${property.unitName} (${property.type}) at ${property.monthlyRent} ETB/month`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return property;
  }

  async update(id: string, dto: UpdatePropertyDto, actor: AuditActor) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Property not found.');
    }

    if (dto.unitName && dto.unitName.trim() !== existing.unitName) {
      const duplicate = await this.prisma.property.findFirst({
        where: {
          unitName: { equals: dto.unitName.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new ConflictException(`Another property with unit name "${dto.unitName}" already exists.`);
      }
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...(dto.unitName && { unitName: dto.unitName.trim() }),
        ...(dto.type && { type: dto.type }),
        ...(dto.monthlyRent !== undefined && { monthlyRent: new Prisma.Decimal(dto.monthlyRent) }),
        ...(dto.status && { status: dto.status }),
      },
      include: PROPERTY_INCLUDE,
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'Property',
      entityId: id,
      status: 'Success',
      description: `Updated property unit ${updated.unitName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async remove(id: string, actor: AuditActor) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        leaseAgreements: { where: { status: 'Active' } },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    if (property.leaseAgreements.length > 0) {
      throw new BadRequestException('Cannot delete property with active leases. Terminate leases first.');
    }

    await this.prisma.property.delete({ where: { id } });

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'Property',
      entityId: id,
      status: 'Success',
      description: `Deleted property unit ${property.unitName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { message: `Property ${property.unitName} successfully deleted.` };
  }

  // ==========================================
  // Leases
  // ==========================================

  async createLease(dto: CreateLeaseDto, actor: AuditActor) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      include: { leaseAgreements: { where: { status: 'Active' } } },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    if (property.leaseAgreements.length > 0) {
      throw new BadRequestException(`Property "${property.unitName}" is already occupied by an active lease.`);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('Lease end date must be after start date.');
    }

    let tenantId = dto.tenantId;
    if (!tenantId) {
      if (!dto.tenantName?.trim()) {
        throw new BadRequestException('Either an existing tenantId or a tenantName is required to create a lease.');
      }
      const newTenant = await this.prisma.tenant.create({
        data: {
          name: dto.tenantName.trim(),
          phone: dto.tenantPhone?.trim() || null,
          email: dto.tenantEmail?.trim() || null,
        },
      });
      tenantId = newTenant.id;
    } else {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) {
        throw new UnprocessableEntityException('Specified tenant not found.');
      }
    }

    const rentAmount = dto.monthlyRent !== undefined
      ? new Prisma.Decimal(dto.monthlyRent)
      : property.monthlyRent;

    const [lease] = await this.prisma.$transaction([
      this.prisma.leaseAgreement.create({
        data: {
          propertyId: property.id,
          tenantId,
          startDate,
          endDate,
          monthlyRent: rentAmount,
          status: 'Active',
        },
        include: { tenant: true, property: true },
      }),
      this.prisma.property.update({
        where: { id: property.id },
        data: { status: 'Occupied' },
      }),
    ]);

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'LeaseAgreement',
      entityId: lease.id,
      status: 'Success',
      description: `Created active lease for property ${property.unitName} to ${lease.tenant.name} at ${lease.monthlyRent} ETB/month`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return lease;
  }

  async terminateLease(leaseId: string, actor: AuditActor) {
    const lease = await this.prisma.leaseAgreement.findUnique({
      where: { id: leaseId },
      include: { property: true, tenant: true },
    });

    if (!lease) {
      throw new NotFoundException('Lease agreement not found.');
    }

    const [updatedLease] = await this.prisma.$transaction([
      this.prisma.leaseAgreement.update({
        where: { id: leaseId },
        data: { status: 'Terminated' },
        include: { tenant: true, property: true },
      }),
      this.prisma.property.update({
        where: { id: lease.propertyId },
        data: { status: 'Vacant' },
      }),
    ]);

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'LeaseAgreement',
      entityId: leaseId,
      status: 'Success',
      description: `Terminated lease for unit ${lease.property.unitName} (Tenant: ${lease.tenant.name})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updatedLease;
  }

  // ==========================================
  // Rent Payments
  // ==========================================

  async createRentPayment(dto: CreateRentPaymentDto, actor: AuditActor) {
    const lease = await this.prisma.leaseAgreement.findUnique({
      where: { id: dto.leaseAgreementId },
      include: { tenant: true, property: true },
    });

    if (!lease) {
      throw new NotFoundException('Lease agreement not found.');
    }

    const payment = await this.prisma.rentPayment.create({
      data: {
        leaseAgreementId: dto.leaseAgreementId,
        amount: new Prisma.Decimal(dto.amount),
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        paymentMethod: dto.paymentMethod ?? 'Cash',
        status: dto.status ?? 'Paid',
      },
      include: {
        leaseAgreement: {
          include: { tenant: true, property: true },
        },
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'RentPayment',
      entityId: payment.id,
      status: 'Success',
      description: `Recorded rent payment of ${dto.amount} ETB for ${lease.property.unitName} (${lease.tenant.name})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return payment;
  }

  async listRentPayments(leaseAgreementId?: string) {
    return this.prisma.rentPayment.findMany({
      where: leaseAgreementId ? { leaseAgreementId } : undefined,
      include: {
        leaseAgreement: {
          include: { tenant: true, property: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ==========================================
  // Maintenance Requests
  // ==========================================

  async createMaintenance(dto: CreateMaintenanceDto, actor: AuditActor) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    const maintenance = await this.prisma.maintenanceRequest.create({
      data: {
        propertyId: dto.propertyId,
        issue: dto.issue.trim(),
        priority: dto.priority ?? 'Medium',
        status: dto.status ?? 'Scheduled',
      },
      include: { property: true },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'MaintenanceRequest',
      entityId: maintenance.id,
      status: 'Success',
      description: `Logged ${maintenance.priority} priority maintenance for ${property.unitName}: ${maintenance.issue}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return maintenance;
  }

  async updateMaintenance(id: string, dto: UpdateMaintenanceDto, actor: AuditActor) {
    const existing = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!existing) {
      throw new NotFoundException('Maintenance request not found.');
    }

    const updated = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...(dto.issue && { issue: dto.issue.trim() }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.status && { status: dto.status }),
      },
      include: { property: true },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'MaintenanceRequest',
      entityId: id,
      status: 'Success',
      description: `Updated maintenance request for ${existing.property.unitName} to ${updated.status}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async listMaintenance(propertyId?: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: propertyId ? { propertyId } : undefined,
      include: { property: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ==========================================
  // Statistics & Dashboard
  // ==========================================

  async stats() {
    const [
      totalProperties,
      occupiedProperties,
      vacantProperties,
      activeLeases,
      overduePayments,
      propertiesByType,
      maintenanceSummary,
    ] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: 'Occupied' } }),
      this.prisma.property.count({ where: { status: 'Vacant' } }),
      this.prisma.leaseAgreement.findMany({
        where: { status: 'Active' },
        select: { monthlyRent: true },
      }),
      this.prisma.rentPayment.findMany({
        where: { status: 'Overdue' },
        select: { amount: true },
      }),
      this.prisma.property.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
      this.prisma.maintenanceRequest.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const totalMonthlyIncome = activeLeases.reduce(
      (sum, l) => sum + Number(l.monthlyRent),
      0,
    );

    const totalOverdueAmount = overduePayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const occupancyRate =
      totalProperties > 0
        ? `${Math.round((occupiedProperties / totalProperties) * 100)}%`
        : '0%';

    return {
      totalProperties,
      occupiedProperties,
      vacantProperties,
      occupancyRate,
      activeLeasesCount: activeLeases.length,
      totalMonthlyIncome,
      overduePaymentsCount: overduePayments.length,
      totalOverdueAmount,
      propertiesByType: propertiesByType.map((r) => ({
        type: r.type,
        count: r._count._all,
      })),
      maintenanceSummary: maintenanceSummary.map((m) => ({
        status: m.status,
        count: m._count._all,
      })),
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
