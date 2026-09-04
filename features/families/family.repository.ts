import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateFamilyInput, ListFamiliesQuery, UpdateFamilyInput } from "./family.validation";

export const familyRepository = {
  async list(query: ListFamiliesQuery) {
    const where: Prisma.FamilyWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.sebekaStatus && { sebekaStatus: query.sebekaStatus }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.family.findMany({
        where,
        include: { members: true, _count: { select: { members: true } } },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.family.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: string) {
    return prisma.family.findUnique({
      where: { id },
      include: {
        members: true,
        familyPayments: { orderBy: { year: "desc" } },
      },
    });
  },

  create(input: CreateFamilyInput) {
    return prisma.family.create({
      data: {
        name: input.name,
        address: input.address || null,
        phone: input.phone || null,
        registrationDate: input.registrationDate,
        status: input.status,
      },
    });
  },

  update(id: string, input: UpdateFamilyInput) {
    return prisma.family.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.address !== undefined && { address: input.address || null }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.registrationDate && { registrationDate: input.registrationDate }),
        ...(input.status && { status: input.status }),
      },
    });
  },

  archive(id: string) {
    return prisma.family.update({ where: { id }, data: { status: "Inactive" } });
  },

  async hasMembers(id: string) {
    const count = await prisma.member.count({ where: { familyId: id, status: { not: "Inactive" } } });
    return count > 0;
  },

  async stats() {
    const [total, active, outstanding, sebekaBreakdownRows, families] = await Promise.all([
      prisma.family.count(),
      prisma.family.count({ where: { status: "Active" } }),
      prisma.family.count({ where: { sebekaStatus: { not: "Paid" } } }),
      prisma.family.groupBy({ by: ["sebekaStatus"], _count: true }),
      prisma.family.findMany({ select: { registrationDate: true } }),
    ]);

    const sebekaBreakdown = sebekaBreakdownRows.map((r: { sebekaStatus: "Paid" | "Partial" | "Unpaid" | "Overdue"; _count: number }) => ({
      status: r.sebekaStatus,
      count: r._count,
    }));

    const byYearMap = new Map<number, number>();
    for (const f of families) {
      const year = f.registrationDate.getFullYear();
      byYearMap.set(year, (byYearMap.get(year) ?? 0) + 1);
    }
    const byYear = Array.from(byYearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({ year: String(year), count }));

    return { total, active, outstanding, sebekaBreakdown, byYear };
  },
};
