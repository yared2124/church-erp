import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListUsersQuery } from "./user.validation";

export const userRepository = {
  async list(query: ListUsersQuery) {
    const where: Prisma.UserWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.role && { roles: { some: { role: { name: query.role } } } }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { roles: { include: { role: true } } },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  },

  async stats() {
    const [total, active, inactive, locked] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "Active" } }),
      prisma.user.count({ where: { status: "Inactive" } }),
      prisma.user.count({ where: { status: "Locked" } }),
    ]);
    return { total, active, inactive, locked };
  },

  async rolesSummary() {
    const roles = await prisma.role.findMany({
      include: { _count: { select: { users: true } }, permissions: { include: { permission: true } } },
      orderBy: { name: "asc" },
    });
    return roles.map((r: { id: string; name: string; _count: { users: number }; permissions: { permission: { key: string } }[] }) => ({
      id: r.id,
      name: r.name,
      users: r._count.users,
      permissions: r.permissions.map((p) => p.permission.key),
    }));
  },
};
