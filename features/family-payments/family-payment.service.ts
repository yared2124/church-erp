import { ApiError } from "@/lib/api-helpers";
import { auditLogRepository } from "@/features/audit-logs/audit-log.repository";
import { familyPaymentRepository } from "./family-payment.repository";
import type {
  CreateFamilyPaymentInput,
  ListFamilyPaymentsQuery,
  UpdateFamilyPaymentInput,
} from "./family-payment.validation";

interface ActingUser {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

export const familyPaymentService = {
  async list(query: ListFamilyPaymentsQuery) {
    const { data, total } = await familyPaymentRepository.list(query);
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
    const payment = await familyPaymentRepository.findById(id);
    if (!payment) throw new ApiError(404, "Payment record not found.");
    return payment;
  },

  async create(input: CreateFamilyPaymentInput, actor: ActingUser) {
    const family = await familyPaymentRepository.familyExists(input.familyId);
    if (!family) throw new ApiError(422, "The selected family does not exist.");

    const existing = await familyPaymentRepository.findByFamilyAndYear(input.familyId, input.year);
    if (existing) {
      throw new ApiError(409, `A payment record for this family and ${input.year} already exists. Edit it instead.`);
    }

    const payment = await familyPaymentRepository.create(input);

    await auditLogRepository.record({
      userId: actor.id,
      action: "CREATE",
      entity: "FamilyPayment",
      entityId: payment.id,
      status: "Success",
      description: `Recorded ${input.year} Sebeka payment for family ${payment.family.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return payment;
  },

  async update(id: string, input: UpdateFamilyPaymentInput, actor: ActingUser) {
    const payment = await familyPaymentRepository.update(id, input);
    if (!payment) throw new ApiError(404, "Payment record not found.");

    await auditLogRepository.record({
      userId: actor.id,
      action: "UPDATE",
      entity: "FamilyPayment",
      entityId: payment.id,
      status: "Success",
      description: `Updated ${payment.year} Sebeka payment for family ${payment.family.name}`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return payment;
  },

  stats: () => familyPaymentRepository.stats(),
};
