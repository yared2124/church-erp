import { ApiError } from "@/lib/api-helpers";
import { auditLogRepository } from "@/features/audit-logs/audit-log.repository";
import { familyRepository } from "./family.repository";
import type { CreateFamilyInput, ListFamiliesQuery, UpdateFamilyInput } from "./family.validation";

interface ActingUser {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

export const familyService = {
  async list(query: ListFamiliesQuery) {
    const { data, total } = await familyRepository.list(query);
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
    const family = await familyRepository.findById(id);
    if (!family) throw new ApiError(404, "Family not found.");
    return family;
  },

  async create(input: CreateFamilyInput, actor: ActingUser) {
    const family = await familyRepository.create(input);
    await auditLogRepository.record({
      userId: actor.id,
      action: "CREATE",
      entity: "Family",
      entityId: family.id,
      status: "Success",
      description: `Created family ${family.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return family;
  },

  async update(id: string, input: UpdateFamilyInput, actor: ActingUser) {
    const existing = await familyRepository.findById(id);
    if (!existing) throw new ApiError(404, "Family not found.");

    const family = await familyRepository.update(id, input);
    await auditLogRepository.record({
      userId: actor.id,
      action: "UPDATE",
      entity: "Family",
      entityId: family.id,
      status: "Success",
      description: `Updated family ${family.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return family;
  },

  /** Soft delete — and refuses if the family still has active members (referential safety). */
  async archive(id: string, actor: ActingUser) {
    const existing = await familyRepository.findById(id);
    if (!existing) throw new ApiError(404, "Family not found.");

    const hasMembers = await familyRepository.hasMembers(id);
    if (hasMembers) {
      throw new ApiError(
        409,
        "This family still has active members. Reassign or archive its members first."
      );
    }

    const family = await familyRepository.archive(id);
    await auditLogRepository.record({
      userId: actor.id,
      action: "DELETE",
      entity: "Family",
      entityId: id,
      status: "Success",
      description: `Archived family ${existing.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return family;
  },

  stats: () => familyRepository.stats(),
};
