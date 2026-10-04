import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, StockStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { QueryInventoryItemDto } from './dto/query-inventory-item.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

const ITEM_INCLUDE = {
  category: true,
  stockMovements: {
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' as const },
    take: 5,
  },
} as const;

function calculateStatus(quantity: number): StockStatus {
  if (quantity <= 0) return 'OutOfStock';
  if (quantity <= 5) return 'LowStock';
  return 'InStock';
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // Inventory Items CRUD
  // ==========================================

  async list(query: QueryInventoryItemDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryItemWhereInput = {
      ...(query.status && { status: query.status as StockStatus }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { location: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        include: { category: true },
        orderBy: [{ updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.inventoryItem.count({ where }),
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
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: ITEM_INCLUDE,
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found.');
    }

    return item;
  }

  async create(dto: CreateInventoryItemDto, actor: AuditActor) {
    const category = await this.prisma.inventoryCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new UnprocessableEntityException('Specified inventory category not found.');
    }

    const quantity = dto.quantity ?? 0;
    const status = dto.status ? (dto.status as StockStatus) : calculateStatus(quantity);

    const item = await this.prisma.inventoryItem.create({
      data: {
        name: dto.name.trim(),
        categoryId: dto.categoryId,
        quantity,
        unitPrice: new Prisma.Decimal(dto.unitPrice),
        location: dto.location?.trim() || null,
        status,
        ...(quantity > 0 && {
          stockMovements: {
            create: {
              changeQty: quantity,
              movementType: 'In',
              reason: 'Initial stock intake upon item creation',
              createdById: actor.id,
            },
          },
        }),
      },
      include: ITEM_INCLUDE,
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'InventoryItem',
      entityId: item.id,
      status: 'Success',
      description: `Added inventory item ${item.name} (${quantity} units @ ${item.unitPrice} ETB) in category ${category.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto, actor: AuditActor) {
    const existing = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Inventory item not found.');
    }

    if (dto.categoryId) {
      const category = await this.prisma.inventoryCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new UnprocessableEntityException('Specified inventory category not found.');
      }
    }

    const newQuantity = dto.quantity !== undefined ? dto.quantity : existing.quantity;
    const newStatus = dto.status
      ? (dto.status as StockStatus)
      : dto.quantity !== undefined
        ? calculateStatus(newQuantity)
        : existing.status;

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.quantity !== undefined && { quantity: newQuantity }),
        ...(dto.unitPrice !== undefined && { unitPrice: new Prisma.Decimal(dto.unitPrice) }),
        ...(dto.location !== undefined && { location: dto.location?.trim() || null }),
        status: newStatus,
      },
      include: ITEM_INCLUDE,
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'InventoryItem',
      entityId: id,
      status: 'Success',
      description: `Updated inventory item ${updated.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async remove(id: string, actor: AuditActor) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { stockMovements: true },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found.');
    }

    await this.prisma.$transaction([
      this.prisma.stockMovement.deleteMany({ where: { itemId: id } }),
      this.prisma.inventoryItem.delete({ where: { id } }),
    ]);

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'InventoryItem',
      entityId: id,
      status: 'Success',
      description: `Deleted inventory item ${item.name} and purged movement records`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { message: `Inventory item ${item.name} deleted successfully.` };
  }

  // ==========================================
  // Stock Movements
  // ==========================================

  async recordMovement(dto: CreateStockMovementDto, actor: AuditActor) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: dto.itemId },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found.');
    }

    let nextQuantity = item.quantity;
    if (dto.movementType === 'Out') {
      if (item.quantity < dto.changeQty) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${item.quantity}, Requested Out: ${dto.changeQty}`,
        );
      }
      nextQuantity = item.quantity - dto.changeQty;
    } else {
      nextQuantity = item.quantity + dto.changeQty;
    }

    const nextStatus = calculateStatus(nextQuantity);

    const [movement, updatedItem] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({
        data: {
          itemId: dto.itemId,
          changeQty: dto.changeQty,
          movementType: dto.movementType,
          reason: dto.reason?.trim() || null,
          createdById: actor.id,
        },
        include: {
          item: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.inventoryItem.update({
        where: { id: dto.itemId },
        data: {
          quantity: nextQuantity,
          status: nextStatus,
        },
        include: ITEM_INCLUDE,
      }),
    ]);

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'StockMovement',
      entityId: movement.id,
      status: 'Success',
      description: `Stock ${dto.movementType}: ${dto.changeQty} units of ${item.name} (Now: ${nextQuantity})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { movement, item: updatedItem };
  }

  async listMovements(itemId?: string) {
    return this.prisma.stockMovement.findMany({
      where: itemId ? { itemId } : undefined,
      include: {
        item: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ==========================================
  // Categories & Suppliers
  // ==========================================

  async listCategories() {
    return this.prisma.inventoryCategory.findMany({
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(dto: CreateCategoryDto, actor: AuditActor) {
    const existing = await this.prisma.inventoryCategory.findUnique({
      where: { name: dto.name.trim() },
    });

    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists.`);
    }

    const category = await this.prisma.inventoryCategory.create({
      data: { name: dto.name.trim() },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'InventoryCategory',
      entityId: category.id,
      status: 'Success',
      description: `Created inventory category: ${category.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return category;
  }

  async listSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createSupplier(dto: CreateSupplierDto, actor: AuditActor) {
    const supplier = await this.prisma.supplier.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim() || null,
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'Supplier',
      entityId: supplier.id,
      status: 'Success',
      description: `Registered inventory supplier: ${supplier.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return supplier;
  }

  // ==========================================
  // Statistics & Dashboard
  // ==========================================

  async stats() {
    const [
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      valueRows,
      activeSuppliers,
      byCategoryRows,
      lowStockAlerts,
      recentMovements,
    ] = await Promise.all([
      this.prisma.inventoryItem.count(),
      this.prisma.inventoryItem.count({ where: { status: 'InStock' } }),
      this.prisma.inventoryItem.count({ where: { status: 'LowStock' } }),
      this.prisma.inventoryItem.count({ where: { status: 'OutOfStock' } }),
      this.prisma.inventoryItem.findMany({ select: { quantity: true, unitPrice: true } }),
      this.prisma.supplier.count(),
      this.prisma.inventoryItem.groupBy({ by: ['categoryId'], _count: { _all: true } }),
      this.prisma.inventoryItem.findMany({
        where: { status: { in: ['LowStock', 'OutOfStock'] } },
        include: { category: true },
        orderBy: { quantity: 'asc' },
        take: 5,
      }),
      this.prisma.stockMovement.findMany({
        include: {
          item: true,
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalValuation = valueRows.reduce(
      (sum, item) => sum + item.quantity * Number(item.unitPrice),
      0,
    );

    const categories = await this.prisma.inventoryCategory.findMany({
      where: { id: { in: byCategoryRows.map((r) => r.categoryId) } },
    });
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const byCategory = byCategoryRows
      .map((r) => ({
        categoryId: r.categoryId,
        categoryName: catMap.get(r.categoryId) ?? 'Unknown',
        count: r._count._all,
        percentage: totalItems > 0 ? `${((r._count._all / totalItems) * 100).toFixed(1)}%` : '0%',
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      totalValuation,
      activeSuppliers,
      byCategory,
      lowStockAlerts,
      recentMovements,
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
