import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HistoryEntryType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryEntryDto } from './dto/create-history-entry.dto';
import { UpdateHistoryEntryDto } from './dto/update-history-entry.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { CreateHistoryDocumentDto } from './dto/create-history-document.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ChurchHistoryService {
  private readonly logger = new Logger(ChurchHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // Timeline Entries
  // ==========================================

  async timeline(query: QueryHistoryDto) {
    const where: Prisma.HistoryEntryWhereInput = {
      ...(query.type && { type: query.type as HistoryEntryType }),
      ...((query.startYear || query.endYear) && {
        year: {
          ...(query.startYear && { gte: query.startYear }),
          ...(query.endYear && { lte: query.endYear }),
        },
      }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.historyEntry.findMany({
      where,
      orderBy: [{ year: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getEntryById(id: string) {
    const entry = await this.prisma.historyEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('History entry not found.');
    }

    return entry;
  }

  async createEntry(dto: CreateHistoryEntryDto, actor: AuditActor) {
    const entry = await this.prisma.historyEntry.create({
      data: {
        year: dto.year,
        title: dto.title.trim(),
        description: dto.description.trim(),
        type: dto.type as HistoryEntryType,
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'HistoryEntry',
      entityId: entry.id,
      status: 'Success',
      description: `Added church history ${entry.type} (${entry.year}): ${entry.title}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return entry;
  }

  async updateEntry(id: string, dto: UpdateHistoryEntryDto, actor: AuditActor) {
    const existing = await this.prisma.historyEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('History entry not found.');
    }

    const updated = await this.prisma.historyEntry.update({
      where: { id },
      data: {
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.title && { title: dto.title.trim() }),
        ...(dto.description && { description: dto.description.trim() }),
        ...(dto.type && { type: dto.type as HistoryEntryType }),
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'HistoryEntry',
      entityId: id,
      status: 'Success',
      description: `Updated history entry ${updated.title} (${updated.year})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async deleteEntry(id: string, actor: AuditActor) {
    const existing = await this.prisma.historyEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('History entry not found.');
    }

    await this.prisma.historyEntry.delete({ where: { id } });

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'HistoryEntry',
      entityId: id,
      status: 'Success',
      description: `Deleted history entry ${existing.title} (${existing.year})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { message: `History entry ${existing.title} deleted successfully.` };
  }

  // ==========================================
  // Historical Documents & Archives
  // ==========================================

  async listDocuments(limit = 50) {
    return this.prisma.historyDocument.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: limit,
    });
  }

  async createDocument(dto: CreateHistoryDocumentDto, actor: AuditActor) {
    const document = await this.prisma.historyDocument.create({
      data: {
        title: dto.title.trim(),
        fileUrl: dto.fileUrl.trim(),
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'HistoryDocument',
      entityId: document.id,
      status: 'Success',
      description: `Uploaded historical archive document: ${document.title}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return document;
  }

  async deleteDocument(id: string, actor: AuditActor) {
    const existing = await this.prisma.historyDocument.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Document not found.');
    }

    await this.prisma.historyDocument.delete({ where: { id } });

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'HistoryDocument',
      entityId: id,
      status: 'Success',
      description: `Deleted historical document: ${existing.title}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { message: `Document ${existing.title} deleted successfully.` };
  }

  // ==========================================
  // Statistics & Historical Analytics
  // ==========================================

  async stats() {
    const [entries, documents] = await Promise.all([
      this.prisma.historyEntry.findMany({ select: { year: true, type: true } }),
      this.prisma.historyDocument.count(),
    ]);

    const years = entries.map((e) => e.year);
    const oldestYear = years.length ? Math.min(...years) : null;
    const currentYear = new Date().getFullYear();
    const yearsOfHistory = oldestYear ? currentYear - oldestYear : 0;
    const majorMilestones = entries.filter((e) => e.type === 'Milestone').length;
    const historicalEvents = entries.filter((e) => e.type === 'Event').length;

    // Group milestones by decade
    const milestoneEntries = entries.filter((e) => e.type === 'Milestone');
    const buckets = new Map<string, number>();
    for (const e of milestoneEntries) {
      const decade = `${Math.floor(e.year / 10) * 10}s`;
      buckets.set(decade, (buckets.get(decade) ?? 0) + 1);
    }

    const totalMilestones = milestoneEntries.length || 1;
    const milestonesByDecade = [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, value]) => ({
        decade: label,
        count: value,
        percentage: `${((value / totalMilestones) * 100).toFixed(1)}%`,
      }));

    return {
      yearsOfHistory,
      majorMilestones,
      historicalEvents,
      documentsCount: documents,
      oldestYear,
      milestonesByDecade,
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
