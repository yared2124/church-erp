import { Injectable, Logger } from '@nestjs/common';
import { ImportStatus, ImportType, ReportFormat } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateImportJobDto } from './dto/create-import-job.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listReports(limit = 50) {
    return this.prisma.generatedReport.findMany({
      include: {
        generatedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createReport(dto: CreateReportDto, actorId: string) {
    const report = await this.prisma.generatedReport.create({
      data: {
        name: dto.name.trim(),
        category: dto.category.trim(),
        format: dto.format as ReportFormat,
        status: 'Completed',
        generatedById: actorId,
      },
      include: {
        generatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: actorId,
          action: 'CREATE',
          entity: 'GeneratedReport',
          entityId: report.id,
          status: 'Success',
          description: `Generated ${report.format} report: ${report.name} (${report.category})`,
        },
      });
    } catch (err) {
      this.logger.error(`Audit log failed: ${(err as Error).message}`);
    }

    return report;
  }

  async overview() {
    const [totalGenerated, categoryRows, recentReports] = await Promise.all([
      this.prisma.generatedReport.count(),
      this.prisma.generatedReport.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      this.prisma.generatedReport.findMany({
        include: {
          generatedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const total = categoryRows.reduce((sum, r) => sum + r._count._all, 0) || 1;
    const reportsByCategory = categoryRows.map((r) => ({
      category: r.category,
      count: r._count._all,
      percentage: `${((r._count._all / total) * 100).toFixed(1)}%`,
    }));

    return {
      totalGenerated,
      reportsByCategory,
      recentReports,
    };
  }

  async listImportJobs(limit = 50) {
    return this.prisma.importJob.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createImportJob(dto: CreateImportJobDto, actorId: string) {
    const job = await this.prisma.importJob.create({
      data: {
        type: dto.type as ImportType,
        totalRecords: dto.totalRecords,
        successCount: dto.successCount ?? 0,
        failCount: dto.failCount ?? 0,
        status: (dto.status as ImportStatus) ?? 'Completed',
        createdById: actorId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: actorId,
          action: 'CREATE',
          entity: 'ImportJob',
          entityId: job.id,
          status: 'Success',
          description: `Bulk imported ${job.type} (${job.successCount}/${job.totalRecords} successful)`,
        },
      });
    } catch (err) {
      this.logger.error(`Audit log failed: ${(err as Error).message}`);
    }

    return job;
  }
}
