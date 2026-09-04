import { certificateRepository } from "./certificate.repository";
import type { ListCertificatesQuery } from "./certificate.validation";

export const certificateService = {
  async list(query: ListCertificatesQuery) {
    const { data, total } = await certificateRepository.list(query);
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

  stats: () => certificateRepository.stats(),
};
