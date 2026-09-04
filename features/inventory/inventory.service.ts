import { inventoryRepository } from "./inventory.repository";
import type { ListInventoryQuery } from "./inventory.validation";

export const inventoryService = {
  async list(query: ListInventoryQuery) {
    const { data, total } = await inventoryRepository.list(query);
    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async overview() {
    const [stats, byCategory, lowStockAlerts, recentStockMovements] = await Promise.all([
      inventoryRepository.stats(),
      inventoryRepository.byCategory(),
      inventoryRepository.lowStockAlerts(),
      inventoryRepository.recentStockMovements(),
    ]);
    return { ...stats, byCategory, lowStockAlerts, recentStockMovements };
  },
};
