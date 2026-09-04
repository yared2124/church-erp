import { auditLogRepository } from "./audit-log.repository";

export const auditLogService = {
  async list(params: { page: number; limit: number; userId?: string; action?: string; entity?: string; status?: "Success" | "Failed" }) {
    const { data, total } = await auditLogRepository.list(params);
    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.limit)),
      },
    };
  },

  stats: () => auditLogRepository.stats(),

  async filterOptions() {
    const [users, actionRows, entityRows] = await auditLogRepository.filterOptions();
    return {
      users,
      actions: actionRows.map((r: { action: string }) => r.action),
      entities: entityRows.map((r: { entity: string }) => r.entity),
    };
  },
};
