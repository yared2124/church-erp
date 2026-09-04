import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListSacramentsQuery } from "./sacrament.validation";

interface RecordRow {
  status: string;
  date: Date;
  church: string;
  priestId: string | null;
  priest: { name: string } | null;
  primaryMember: { gender: "Male" | "Female" };
}

export const sacramentRepository = {
  async list(query: ListSacramentsQuery) {
    const where: Prisma.SacramentWhereInput = {
      type: query.type,
      ...(query.status && { status: query.status }),
      ...(query.priestId && { priestId: query.priestId }),
      ...(query.search && {
        OR: [
          { primaryMember: { firstName: { contains: query.search, mode: "insensitive" } } },
          { primaryMember: { lastName: { contains: query.search, mode: "insensitive" } } },
          { family: { name: { contains: query.search, mode: "insensitive" } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.sacrament.findMany({
        where,
        include: {
          primaryMember: true,
          secondaryMember: true,
          family: true,
          priest: true,
          registeredBy: true,
          sponsors: true,
        },
        orderBy: { date: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.sacrament.count({ where }),
    ]);

    return { data, total };
  },

  async statsFor(type: "Baptism" | "Marriage" | "Burial") {
    const records = await prisma.sacrament.findMany({
      where: { type },
      select: { status: true, date: true, church: true, priestId: true, priest: { select: { name: true } }, primaryMember: { select: { gender: true } } },
    });

    const male = records.filter((r: RecordRow) => r.primaryMember.gender === "Male").length;
    const female = records.filter((r: RecordRow) => r.primaryMember.gender === "Female").length;
    const approved = records.filter((r: RecordRow) => r.status === "Approved").length;
    const pending = records.filter((r: RecordRow) => r.status === "Pending").length;

    const now = new Date();
    const thisYear = records.filter((r: RecordRow) => r.date.getFullYear() === now.getFullYear()).length;
    const lastYear = records.filter((r: RecordRow) => r.date.getFullYear() === now.getFullYear() - 1).length;

    const monthCounts = new Map<string, number>();
    for (const r of records) {
      if (r.date.getFullYear() !== now.getFullYear()) continue;
      const key = r.date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
    const mostActiveMonth = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const priestCounts = new Map<string, { name: string; count: number }>();
    for (const r of records) {
      if (!r.priestId || !r.priest) continue;
      const existing = priestCounts.get(r.priestId);
      priestCounts.set(r.priestId, { name: r.priest.name, count: (existing?.count ?? 0) + 1 });
    }
    const topPriest = [...priestCounts.values()].sort((a, b) => b.count - a.count)[0]?.name ?? "—";

    const churchCounts = new Map<string, number>();
    for (const r of records) {
      churchCounts.set(r.church, (churchCounts.get(r.church) ?? 0) + 1);
    }
    const topChurch = [...churchCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return { total: records.length, male, female, approved, pending, thisYear, lastYear, mostActiveMonth, topPriest, topChurch };
  },

  priestOptions(type: "Baptism" | "Marriage" | "Burial") {
    return prisma.user.findMany({
      where: { presidedSacraments: { some: { type } } },
      select: { id: true, name: true },
    });
  },
};
