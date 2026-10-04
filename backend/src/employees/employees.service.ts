import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EmployeeStatus, EmploymentType, LeaveStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { CreateLeaveRequestDto, UpdateLeaveStatusDto } from './dto/create-leave-request.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

const EMPLOYEE_INCLUDE = {
  user: { select: { id: true, name: true, email: true, status: true } },
  leaveRequests: {
    orderBy: { createdAt: 'desc' as const },
    take: 5,
  },
} as const;

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // Employees CRUD
  // ==========================================

  async list(query: QueryEmployeeDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {
      ...(query.department && { department: query.department }),
      ...(query.employmentType && { employmentType: query.employmentType as EmploymentType }),
      ...(query.status && { status: query.status as EmployeeStatus }),
      ...(query.search && {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { position: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: EMPLOYEE_INCLUDE,
        orderBy: [{ fullName: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
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
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        leaveRequests: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto, actor: AuditActor) {
    if (dto.userId) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      if (!user) {
        throw new UnprocessableEntityException('Specified user not found.');
      }
      const existingAssignment = await this.prisma.employee.findUnique({
        where: { userId: dto.userId },
      });
      if (existingAssignment) {
        throw new ConflictException('This user account is already linked to another employee record.');
      }
    }

    const employee = await this.prisma.employee.create({
      data: {
        fullName: dto.fullName.trim(),
        department: dto.department.trim(),
        position: dto.position.trim(),
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim() || null,
        employmentType: (dto.employmentType as EmploymentType) ?? 'FullTime',
        status: (dto.status as EmployeeStatus) ?? 'Active',
        joinDate: dto.joinDate ? new Date(dto.joinDate) : new Date(),
        userId: dto.userId || null,
      },
      include: EMPLOYEE_INCLUDE,
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'Employee',
      entityId: employee.id,
      status: 'Success',
      description: `Registered employee ${employee.fullName} (${employee.position} - ${employee.department})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, actor: AuditActor) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Employee not found.');
    }

    if (dto.userId && dto.userId !== existing.userId) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      if (!user) {
        throw new UnprocessableEntityException('Specified user not found.');
      }
      const duplicate = await this.prisma.employee.findUnique({ where: { userId: dto.userId } });
      if (duplicate) {
        throw new ConflictException('This user account is already linked to another employee record.');
      }
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName.trim() }),
        ...(dto.department && { department: dto.department.trim() }),
        ...(dto.position && { position: dto.position.trim() }),
        ...(dto.phone !== undefined && { phone: dto.phone?.trim() || null }),
        ...(dto.email !== undefined && { email: dto.email?.trim() || null }),
        ...(dto.employmentType && { employmentType: dto.employmentType as EmploymentType }),
        ...(dto.status && { status: dto.status as EmployeeStatus }),
        ...(dto.joinDate && { joinDate: new Date(dto.joinDate) }),
        ...(dto.userId !== undefined && { userId: dto.userId || null }),
      },
      include: EMPLOYEE_INCLUDE,
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'Employee',
      entityId: id,
      status: 'Success',
      description: `Updated employee record for ${updated.fullName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async remove(id: string, actor: AuditActor) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    await this.prisma.$transaction([
      this.prisma.leaveRequest.deleteMany({ where: { employeeId: id } }),
      this.prisma.employee.delete({ where: { id } }),
    ]);

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'Employee',
      entityId: id,
      status: 'Success',
      description: `Removed employee record for ${employee.fullName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { message: `Employee ${employee.fullName} deleted successfully.` };
  }

  // ==========================================
  // Leave Management
  // ==========================================

  async createLeaveRequest(dto: CreateLeaveRequestDto, actor: AuditActor) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('Leave end date cannot be earlier than start date.');
    }

    const leave = await this.prisma.leaveRequest.create({
      data: {
        employeeId: dto.employeeId,
        startDate,
        endDate,
        reason: dto.reason?.trim() || null,
        status: (dto.status as LeaveStatus) ?? 'Pending',
      },
      include: { employee: true },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'LeaveRequest',
      entityId: leave.id,
      status: 'Success',
      description: `Submitted leave request for ${employee.fullName} (${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return leave;
  }

  async updateLeaveStatus(leaveId: string, dto: UpdateLeaveStatusDto, actor: AuditActor) {
    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { employee: true },
    });

    if (!existing) {
      throw new NotFoundException('Leave request not found.');
    }

    const targetStatus = dto.status as LeaveStatus;

    const [updatedLeave] = await this.prisma.$transaction([
      this.prisma.leaveRequest.update({
        where: { id: leaveId },
        data: {
          status: targetStatus,
          ...(dto.reason && { reason: dto.reason.trim() }),
        },
        include: { employee: true },
      }),
      ...(targetStatus === 'Approved'
        ? [
            this.prisma.employee.update({
              where: { id: existing.employeeId },
              data: { status: 'OnLeave' },
            }),
          ]
        : existing.status === 'Approved' && targetStatus !== 'Approved'
        ? [
            this.prisma.employee.update({
              where: { id: existing.employeeId },
              data: { status: 'Active' },
            }),
          ]
        : []),
    ]);

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'LeaveRequest',
      entityId: leaveId,
      status: 'Success',
      description: `Leave request for ${existing.employee.fullName} updated to ${targetStatus}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updatedLeave;
  }

  async listLeaveRequests(employeeId?: string) {
    return this.prisma.leaveRequest.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ==========================================
  // Statistics & Dashboard
  // ==========================================

  async stats() {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeCount,
      onLeaveCount,
      departedCount,
      newHiresThisMonth,
      byDepartmentRows,
      byEmploymentTypeRows,
      leaveSummaryRows,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { status: 'Active' } }),
      this.prisma.employee.count({ where: { status: 'OnLeave' } }),
      this.prisma.employee.count({ where: { status: 'Departed' } }),
      this.prisma.employee.count({ where: { joinDate: { gte: monthStart } } }),
      this.prisma.employee.groupBy({ by: ['department'], _count: { _all: true } }),
      this.prisma.employee.groupBy({ by: ['employmentType'], _count: { _all: true } }),
      this.prisma.leaveRequest.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const byDepartment = byDepartmentRows
      .map((r) => ({
        department: r.department,
        count: r._count._all,
        percentage: totalEmployees > 0 ? `${((r._count._all / totalEmployees) * 100).toFixed(1)}%` : '0%',
      }))
      .sort((a, b) => b.count - a.count);

    const byEmploymentType = byEmploymentTypeRows.map((r) => ({
      employmentType: r.employmentType,
      count: r._count._all,
      percentage: totalEmployees > 0 ? `${((r._count._all / totalEmployees) * 100).toFixed(1)}%` : '0%',
    }));

    const leaveSummary = leaveSummaryRows.map((l) => ({
      status: l.status,
      count: l._count._all,
    }));

    return {
      totalEmployees,
      activeCount,
      onLeaveCount,
      departedCount,
      newHiresThisMonth,
      byDepartment,
      byEmploymentType,
      leaveSummary,
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
