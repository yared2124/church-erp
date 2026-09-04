import { sacramentRepository } from "./sacrament.repository";
import type { ListSacramentsQuery } from "./sacrament.validation";

export const sacramentService = {
  async list(query: ListSacramentsQuery) {
    const { data, total } = await sacramentRepository.list(query);
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

  statsFor: (type: "Baptism" | "Marriage" | "Burial") => sacramentRepository.statsFor(type),
  priestOptions: (type: "Baptism" | "Marriage" | "Burial") => sacramentRepository.priestOptions(type),
};
