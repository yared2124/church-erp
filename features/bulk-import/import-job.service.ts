import { prisma } from "@/lib/prisma";

export const importJobRepository = {
  async stats() {
    const [totalImports, successfulImports, failedImports, lastImport, recordsAgg] = await Promise.all([
      prisma.importJob.count(),
      prisma.importJob.count({ where: { status: "Completed" } }),
      prisma.importJob.count({ where: { status: "Failed" } }),
      prisma.importJob.findFirst({ orderBy: { createdAt: "desc" }, include: { createdBy: true } }),
      prisma.importJob.aggregate({ _sum: { successCount: true } }),
    ]);
    return {
      totalImports,
      successfulImports,
      failedImports,
      lastImport,
      totalRecordsImported: recordsAgg._sum.successCount ?? 0,
    };
  },
};

export const importJobService = {
  stats: () => importJobRepository.stats(),
};
