import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListInventoryQuery } from "./inventory.validation";

export const inventoryRepository = {
  async list(query: ListInventoryQuery) {
    const where: Prisma.InventoryItemWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.category && { category: { name: query.category } }),
      ...(query.search && { name: { contains: query.search, mode: "insensitive" } }),
    };

    const [data, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: { category: true },
        orderBy: { updatedAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return { data, total };
  },

  async stats() {
    const [totalItems, inStock, lowStock, outOfStock, valueRows, suppliers] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.count({ where: { status: "InStock" } }),
      prisma.inventoryItem.count({ where: { status: "LowStock" } }),
      prisma.inventoryItem.count({ where: { status: "OutOfStock" } }),
      prisma.inventoryItem.findMany({ select: { quantity: true, unitPrice: true } }),
      prisma.supplier.count(),
    ]);

    const totalValue = valueRows.reduce((sum: number, i: { quantity: number; unitPrice: unknown }) => sum + i.quantity * Number(i.unitPrice), 0);

    return { totalItems, inStock, lowStock, outOfStock, totalValue, activeSuppliers: suppliers };
  },

  async byCategory() {
    const rows = await prisma.inventoryItem.groupBy({ by: ["categoryId"], _count: true });
    const categories = await prisma.inventoryCategory.findMany({ where: { id: { in: rows.map((r: { categoryId: string }) => r.categoryId) } } });
    const map = new Map<string, string>(categories.map((c: { id: string; name: string }): [string, string] => [c.id, c.name]));
    const total = rows.reduce((s: number, r: { _count: number }) => s + r._count, 0);
    return rows
      .map((r: { categoryId: string; _count: number }) => ({
        label: map.get(r.categoryId) ?? "Unknown",
        value: r._count,
        pct: total > 0 ? `${((r._count / total) * 100).toFixed(0)}%` : "0%",
      }))
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value);
  },

  lowStockAlerts(limit = 5) {
    return prisma.inventoryItem.findMany({
      where: { status: { in: ["LowStock", "OutOfStock"] } },
      include: { category: true },
      orderBy: { quantity: "asc" },
      take: limit,
    });
  },

  recentStockMovements(limit = 5) {
    return prisma.stockMovement.findMany({
      include: { item: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
