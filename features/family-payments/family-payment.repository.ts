import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { derivePaymentStatus } from "./family-payment.validation";
import type {
  CreateFamilyPaymentInput,
  ListFamilyPaymentsQuery,
  UpdateFamilyPaymentInput,
} from "./family-payment.validation";

const OVERDUE_CUTOFF_DAYS = 60;

function isOverdue(year: number) {
  const yearEnd = new Date(year, 11, 31);
  const daysSinceYearEnd = (Date.now() - yearEnd.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceYearEnd > OVERDUE_CUTOFF_DAYS;
}

export const familyPaymentRepository = {
  async list(query: ListFamilyPaymentsQuery) {
    const where: Prisma.FamilyPaymentWhereInput = {
      ...(query.year && { year: query.year }),
      ...(query.status && { status: query.status }),
      ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
      ...(query.search && {
        OR: [
          { receiptNumber: { contains: query.search, mode: "insensitive" } },
          { family: { name: { contains: query.search, mode: "insensitive" } } },
          { family: { phone: { contains: query.search } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.familyPayment.findMany({
        where,
        include: {
          family: true,
          recordedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.familyPayment.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: string) {
    return prisma.familyPayment.findUnique({
      where: { id },
      include: {
        family: true,
        recordedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  findByFamilyAndYear(familyId: string, year: number) {
    return prisma.familyPayment.findUnique({ where: { familyId_year: { familyId, year } } });
  },

  async create(input: CreateFamilyPaymentInput) {
    const status = derivePaymentStatus(input.expectedAmount, input.paidAmount, isOverdue(input.year));

    // Creating a payment and reflecting it on the family's own sebekaStatus
    // must succeed or fail together — hence the transaction.
    return prisma.$transaction(async (tx) => {
      const payment = await tx.familyPayment.create({
        data: {
          familyId: input.familyId,
          year: input.year,
          expectedAmount: input.expectedAmount,
          paidAmount: input.paidAmount,
          paymentDate: input.paymentDate,
          paymentMethod: input.paymentMethod,
          receiptNumber: input.receiptNumber,
          receiptUrl: input.receiptUrl,
          notes: input.notes,
          recordedById: input.recordedById,
          status,
        },
        include: {
          family: true,
          recordedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.family.update({
        where: { id: input.familyId },
        data: { sebekaStatus: status },
      });

      return payment;
    });
  },

  async update(id: string, input: UpdateFamilyPaymentInput) {
    const existing = await prisma.familyPayment.findUnique({ where: { id } });
    if (!existing) return null;

    const expectedAmount = input.expectedAmount ?? Number(existing.expectedAmount);
    const paidAmount = input.paidAmount ?? Number(existing.paidAmount);
    const status = derivePaymentStatus(expectedAmount, paidAmount, isOverdue(existing.year));

    return prisma.$transaction(async (tx) => {
      const payment = await tx.familyPayment.update({
        where: { id },
        data: {
          ...(input.expectedAmount !== undefined && { expectedAmount: input.expectedAmount }),
          ...(input.paidAmount !== undefined && { paidAmount: input.paidAmount }),
          ...(input.paymentDate && { paymentDate: input.paymentDate }),
          ...(input.paymentMethod && { paymentMethod: input.paymentMethod }),
          ...(input.receiptNumber !== undefined && { receiptNumber: input.receiptNumber }),
          ...(input.receiptUrl !== undefined && { receiptUrl: input.receiptUrl }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.recordedById !== undefined && { recordedById: input.recordedById }),
          status,
        },
        include: {
          family: true,
          recordedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.family.update({
        where: { id: existing.familyId },
        data: { sebekaStatus: status },
      });

      return payment;
    });
  },

  familyExists(familyId: string) {
    return prisma.family.findUnique({ where: { id: familyId }, select: { id: true } });
  },

  async stats() {
    type Row = { expectedAmount: unknown; paidAmount: unknown; status: string };
    const rows: Row[] = await prisma.familyPayment.findMany({
      select: { expectedAmount: true, paidAmount: true, status: true },
    });
    const totalCollected = rows.reduce((sum: number, r: Row) => sum + Number(r.paidAmount), 0);
    const expected = rows.reduce((sum: number, r: Row) => sum + Number(r.expectedAmount), 0);
    const familiesPaid = rows.filter((r: Row) => r.status === "Paid").length;
    const familiesUnpaid = rows.filter((r: Row) => r.status === "Unpaid" || r.status === "Overdue").length;
    return { totalCollected, expected, outstanding: expected - totalCollected, familiesPaid, familiesUnpaid };
  },
};
