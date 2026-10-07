import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const CHURCH_INFO_DEFAULTS = {
  churchName: "Chagni Birhane Genet Kidist Ba'ata Lemariyam",
  shortName: 'BGSM Church',
  address: 'P.O. Box 12345, Addis Ababa, Ethiopia',
  phone: '+251 11 123 4567',
  email: 'info@bgsmmchurch.et',
  website: 'https://www.bgsmmchurch.et',
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.systemSetting.findMany({
      include: {
        updatedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { key: 'asc' },
    });
  }

  async get(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
      include: {
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!setting) {
      if (key === 'church_information') {
        return { key, value: CHURCH_INFO_DEFAULTS, updatedAt: new Date(), updatedBy: null };
      }
      throw new NotFoundException(`Setting with key "${key}" not found.`);
    }

    return setting;
  }

  async upsert(key: string, value: Record<string, unknown>, actorId: string) {
    const jsonValue = value as unknown as Prisma.InputJsonValue;

    const setting = await this.prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: jsonValue,
        updatedById: actorId,
      },
      update: {
        value: jsonValue,
        updatedById: actorId,
      },
      include: {
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: actorId,
          action: 'UPDATE',
          entity: 'SystemSetting',
          entityId: setting.id,
          status: 'Success',
          description: `Updated system setting "${key}"`,
        },
      });
    } catch (err) {
      this.logger.error(`Audit log failed: ${(err as Error).message}`);
    }

    return setting;
  }
}
