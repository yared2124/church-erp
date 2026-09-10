import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateMemberInput, ListMembersQuery, UpdateMemberInput } from "./member.validation";

/**
 * Data access only — no business rules, no authorization checks. Those
 * belong in member.service.ts. Nothing outside this feature folder should
 * import PrismaClient directly for member data.
 */
export const memberRepository = {
  async list(query: ListMembersQuery) {
    const where: Prisma.MemberWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.roleInFamily && { roleInFamily: query.roleInFamily }),
      ...(query.familyId && { familyId: query.familyId }),
      ...(query.confessorPriestId && { confessorPriestId: query.confessorPriestId }),
      ...(query.sebekaStatus && { family: { sebekaStatus: query.sebekaStatus } }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { middleName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          family: true,
          confessorPriest: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.member.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: string) {
    return prisma.member.findUnique({
      where: { id },
      include: { family: true, confessorPriest: true },
    });
  },

  create(input: CreateMemberInput) {
    return prisma.member.create({
      data: {
        familyId: input.familyId,
        firstName: input.firstName,
        middleName: input.middleName || null,
        lastName: input.lastName,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        phone: input.phone || null,
        email: input.email || null,
        address: input.address || null,
        roleInFamily: input.roleInFamily,
        status: input.status,
        confessorPriestId: input.confessorPriestId || null,
        baptizedDate: input.baptizedDate,
        membershipDate: input.membershipDate,
      },
      include: { family: true },
    });
  },

  update(id: string, input: UpdateMemberInput) {
    return prisma.member.update({
      where: { id },
      data: {
        ...(input.familyId && { familyId: input.familyId }),
        ...(input.firstName && { firstName: input.firstName }),
        ...(input.middleName !== undefined && { middleName: input.middleName || null }),
        ...(input.lastName && { lastName: input.lastName }),
        ...(input.gender && { gender: input.gender }),
        ...(input.dateOfBirth && { dateOfBirth: input.dateOfBirth }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.email !== undefined && { email: input.email || null }),
        ...(input.address !== undefined && { address: input.address || null }),
        ...(input.roleInFamily && { roleInFamily: input.roleInFamily }),
        ...(input.status && { status: input.status }),
        ...(input.confessorPriestId !== undefined && { confessorPriestId: input.confessorPriestId || null }),
        ...(input.baptizedDate && { baptizedDate: input.baptizedDate }),
        ...(input.membershipDate && { membershipDate: input.membershipDate }),
      },
      include: { family: true },
    });
  },

  /** Soft delete — members are never hard-deleted (sacraments/certificates reference them). */
  archive(id: string) {
    return prisma.member.update({
      where: { id },
      data: { status: "Inactive" },
    });
  },

  familyExists(familyId: string) {
    return prisma.family.findUnique({ where: { id: familyId }, select: { id: true } });
  },

  async stats(priestId?: string) {
    const filter = priestId ? { confessorPriestId: priestId } : {};
    const [total, active, inactive, newThisMonth, sebekaPaid, sebekaUnpaid] = await Promise.all([
      prisma.member.count({ where: filter }),
      prisma.member.count({ where: { ...filter, status: "Active" } }),
      prisma.member.count({ where: { ...filter, status: "Inactive" } }),
      prisma.member.count({
        where: {
          ...filter,
          membershipDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.member.count({
        where: { ...filter, family: { sebekaStatus: "Paid" } },
      }),
      prisma.member.count({
        where: { ...filter, family: { sebekaStatus: { not: "Paid" } } },
      }),
    ]);
    return { total, active, inactive, newThisMonth, sebekaPaid, sebekaUnpaid };
  },

  async genderBreakdown(priestId?: string) {
    const where = priestId ? { confessorPriestId: priestId } : undefined;
    const rows = await prisma.member.groupBy({ by: ["gender"], where, _count: true });
    return rows.map((r: { gender: "Male" | "Female"; _count: number }) => ({ gender: r.gender, count: r._count }));
  },

  /**
   * Age buckets computed in Node rather than SQL — acceptable for a
   * church-scale dataset (thousands, not millions, of rows) where a single
   * narrow-column query is cheap.
   */
  async ageBreakdown(priestId?: string) {
    const where = priestId ? { confessorPriestId: priestId } : undefined;
    const rows = await prisma.member.findMany({ where, select: { dateOfBirth: true } });
    const buckets = { "0-17": 0, "18-30": 0, "31-45": 0, "46-60": 0, "60+": 0 };
    const now = Date.now();
    for (const { dateOfBirth } of rows) {
      const age = (now - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) buckets["0-17"]++;
      else if (age < 31) buckets["18-30"]++;
      else if (age < 46) buckets["31-45"]++;
      else if (age < 61) buckets["46-60"]++;
      else buckets["60+"]++;
    }
    return Object.entries(buckets).map(([group, count]) => ({ group, count }));
  },

  async recent(limit: number, priestId?: string) {
    const where = priestId ? { confessorPriestId: priestId } : undefined;
    return prisma.member.findMany({
      where,
      orderBy: { membershipDate: "desc" },
      take: limit,
      include: {
        family: true,
        confessorPriest: { select: { id: true, name: true } },
      },
    });
  },
};
