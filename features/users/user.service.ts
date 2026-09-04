import { userRepository } from "./user.repository";
import type { ListUsersQuery } from "./user.validation";

export const userService = {
  async list(query: ListUsersQuery) {
    const { data, total } = await userRepository.list(query);
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

  stats: () => userRepository.stats(),
  rolesSummary: () => userRepository.rolesSummary(),
};
