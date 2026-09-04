import { prisma } from "@/lib/prisma";

export const reportRepository = {
  recent(limit = 5) {
    return prisma.generatedReport.findMany({
      include: { generatedBy: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async stats() {
    const [totalGenerated, byCategory] = await Promise.all([
      prisma.generatedReport.count(),
      prisma.generatedReport.groupBy({ by: ["category"], _count: true }),
    ]);
    return { totalGenerated, byCategory };
  },
};

export const reportService = {
  async overview() {
    const [recentReports, stats] = await Promise.all([reportRepository.recent(), reportRepository.stats()]);
    const total = stats.byCategory.reduce((s: number, r: { _count: number }) => s + r._count, 0) || 1;
    const reportsByCategory = stats.byCategory.map((r: { category: string; _count: number }) => ({
      label: r.category,
      value: r._count,
      pct: `${((r._count / total) * 100).toFixed(1)}%`,
    }));
    return { recentReports, totalGenerated: stats.totalGenerated, reportsByCategory };
  },
};
