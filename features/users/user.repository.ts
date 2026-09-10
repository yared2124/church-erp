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

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string | null;
    status: "Active" | "Inactive" | "Locked";
    role: string;
  }) {
    return prisma.$transaction(async (tx) => {
      let roleRecord = await tx.role.findUnique({ where: { name: data.role } });
      if (!roleRecord) {
        roleRecord = await tx.role.create({ data: { name: data.role } });
      }

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          phone: data.phone ?? null,
          status: data.status,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { roles: { include: { role: true } } },
      });
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string;
      phone?: string | null;
      status?: "Active" | "Inactive" | "Locked";
      role?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.role) {
        let roleRecord = await tx.role.findUnique({ where: { name: data.role } });
        if (!roleRecord) {
          roleRecord = await tx.role.create({ data: { name: data.role } });
        }
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.create({
          data: {
            userId: id,
            roleId: roleRecord.id,
          },
        });
      }

      await tx.user.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
          ...(data.passwordHash && { passwordHash: data.passwordHash }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.status && { status: data.status }),
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id },
        include: { roles: { include: { role: true } } },
      });
    });
  },

  async delete(id: string) {
    const [txCount, sacramentCount, certCount] = await Promise.all([
      prisma.transaction.count({ where: { createdById: id } }),
      prisma.sacrament.count({ where: { OR: [{ registeredById: id }, { priestId: id }] } }),
      prisma.certificateRequest.count({ where: { requestedById: id } }),
    ]);

    if (txCount > 0 || sacramentCount > 0 || certCount > 0) {
      await prisma.user.update({
        where: { id },
        data: { status: "Inactive" },
      });
      return {
        deleted: false,
        reason: "User has linked historical records (transactions, sacraments, or certificates). The account has been deactivated instead.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    return { deleted: true };
  },
};
