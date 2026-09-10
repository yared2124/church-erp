import bcrypt from "bcryptjs";
import { ApiError } from "@/lib/api-helpers";
import { auditLogRepository } from "@/features/audit-logs/audit-log.repository";
import { userRepository } from "./user.repository";
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from "./user.validation";

interface ActingUser {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

export const userService = {
  async list(query: ListUsersQuery) {
    const { data, total } = await userRepository.list(query);
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

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new ApiError(404, "User not found.");
    return user;
  },

  async create(input: CreateUserInput, actor: ActingUser) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(409, "A user with this email address already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      role: input.role,
      status: input.status,
    });

    await auditLogRepository.record({
      userId: actor.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      status: "Success",
      description: `Created user ${user.name} (${user.email}) with role ${input.role}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return user;
  },

  async update(id: string, input: UpdateUserInput, actor: ActingUser) {
    const existing = await userRepository.findById(id);
    if (!existing) throw new ApiError(404, "User not found.");

    if (input.email && input.email !== existing.email) {
      const emailTaken = await userRepository.findByEmail(input.email);
      if (emailTaken && emailTaken.id !== id) {
        throw new ApiError(409, "A user with this email address already exists.");
      }
    }

    let passwordHash: string | undefined;
    if (input.password && input.password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(input.password, 10);
    }

    const updated = await userRepository.update(id, {
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      status: input.status,
      role: input.role,
    });

    await auditLogRepository.record({
      userId: actor.id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      status: "Success",
      description: `Updated user ${updated.name} (${updated.email})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  },

  async delete(id: string, actor: ActingUser) {
    if (id === actor.id) {
      throw new ApiError(400, "You cannot delete your own account.");
    }

    const existing = await userRepository.findById(id);
    if (!existing) throw new ApiError(404, "User not found.");

    const result = await userRepository.delete(id);

    await auditLogRepository.record({
      userId: actor.id,
      action: result.deleted ? "DELETE" : "DEACTIVATE",
      entity: "User",
      entityId: id,
      status: "Success",
      description: result.deleted
        ? `Permanently deleted user ${existing.name} (${existing.email})`
        : `Deactivated user ${existing.name} (${existing.email}) due to linked historical records`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return result;
  },

  stats: () => userRepository.stats(),
  rolesSummary: () => userRepository.rolesSummary(),
};
