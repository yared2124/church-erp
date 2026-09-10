import { ApiError } from "@/lib/api-helpers";
import { auditLogRepository } from "@/features/audit-logs/audit-log.repository";
import { memberRepository } from "./member.repository";
import type { CreateMemberInput, ListMembersQuery, UpdateMemberInput } from "./member.validation";

interface ActingUser {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

export const memberService = {
  async list(query: ListMembersQuery) {
    const { data, total } = await memberRepository.list(query);
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
    const member = await memberRepository.findById(id);
    if (!member) throw new ApiError(404, "Member not found.");
    return member;
  },

  async create(input: CreateMemberInput, actor: ActingUser) {
    const family = await memberRepository.familyExists(input.familyId);
    if (!family) throw new ApiError(422, "The selected family does not exist.");

    const member = await memberRepository.create(input);

    await auditLogRepository.record({
      userId: actor.id,
      action: "CREATE",
      entity: "Member",
      entityId: member.id,
      status: "Success",
      description: `Created member ${member.firstName} ${member.lastName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return member;
  },

  async update(id: string, input: UpdateMemberInput, actor: ActingUser) {
    const existing = await memberRepository.findById(id);
    if (!existing) throw new ApiError(404, "Member not found.");

    if (input.familyId) {
      const family = await memberRepository.familyExists(input.familyId);
      if (!family) throw new ApiError(422, "The selected family does not exist.");
    }

    const member = await memberRepository.update(id, input);

    await auditLogRepository.record({
      userId: actor.id,
      action: "UPDATE",
      entity: "Member",
      entityId: member.id,
      status: "Success",
      description: `Updated member ${member.firstName} ${member.lastName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return member;
  },

  /** Members are soft-deleted (status → Inactive), never hard-deleted. */
  async archive(id: string, actor: ActingUser) {
    const existing = await memberRepository.findById(id);
    if (!existing) throw new ApiError(404, "Member not found.");

    const member = await memberRepository.archive(id);

    await auditLogRepository.record({
      userId: actor.id,
      action: "DELETE",
      entity: "Member",
      entityId: id,
      status: "Success",
      description: `Archived (soft-deleted) member ${existing.firstName} ${existing.lastName}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return member;
  },

  stats: (priestId?: string) => memberRepository.stats(priestId),
  genderBreakdown: (priestId?: string) => memberRepository.genderBreakdown(priestId),
  ageBreakdown: (priestId?: string) => memberRepository.ageBreakdown(priestId),
  recent: (limit: number, priestId?: string) => memberRepository.recent(limit, priestId),
};
