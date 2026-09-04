import { prisma } from "@/lib/prisma";

export const historyRepository = {
  timeline() {
    return prisma.historyEntry.findMany({ orderBy: { year: "asc" } });
  },

  documents(limit = 5) {
    return prisma.historyDocument.findMany({ orderBy: { uploadedAt: "desc" }, take: limit });
  },

  async stats() {
    const [entries, documents] = await Promise.all([
      prisma.historyEntry.findMany({ select: { year: true, type: true } }),
      prisma.historyDocument.count(),
    ]);

    const years = entries.map((e: { year: number }) => e.year);
    const yearsOfHistory = years.length > 0 ? new Date().getFullYear() - Math.min(...years) : 0;
    const majorMilestones = entries.filter((e: { type: string }) => e.type === "Milestone").length;
    const historicalEvents = entries.filter((e: { type: string }) => e.type === "Event").length;

    return { yearsOfHistory, majorMilestones, historicalEvents, documents, oldestYear: years.length ? Math.min(...years) : null };
  },

  async milestonesByCategory() {
    // No category field on HistoryEntry — grouping by decade as the closest
    // real dimension we actually have, rather than fabricating categories.
    const entries = await prisma.historyEntry.findMany({ where: { type: "Milestone" }, select: { year: true } });
    const buckets = new Map<string, number>();
    for (const e of entries) {
      const decade = `${Math.floor(e.year / 10) * 10}s`;
      buckets.set(decade, (buckets.get(decade) ?? 0) + 1);
    }
    const total = entries.length || 1;
    return [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, value]) => ({ label, value, pct: `${((value / total) * 100).toFixed(1)}%` }));
  },
};
