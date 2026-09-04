import { historyRepository } from "./history.repository";

export const historyService = {
  async overview() {
    const [timeline, documentList, stats, milestonesByCategory] = await Promise.all([
      historyRepository.timeline(),
      historyRepository.documents(),
      historyRepository.stats(),
      historyRepository.milestonesByCategory(),
    ]);
    return { timeline, documentList, ...stats, milestonesByCategory };
  },
};
