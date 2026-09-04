import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListCertificatesQuery } from "./certificate.validation";

export const certificateRepository = {
  async list(query: ListCertificatesQuery) {
    const where: Prisma.CertificateRequestWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        member: {
          OR: [
            { firstName: { contains: query.search, mode: "insensitive" } },
            { lastName: { contains: query.search, mode: "insensitive" } },
          ],
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.certificateRequest.findMany({
        where,
        include: { member: true, requestedBy: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.certificateRequest.count({ where }),
    ]);

    return { data, total };
  },

  async stats() {
    const [total, pending, approved, rejected, issued] = await Promise.all([
      prisma.certificateRequest.count(),
      prisma.certificateRequest.count({ where: { status: "Pending" } }),
      prisma.certificateRequest.count({ where: { status: "Approved" } }),
      prisma.certificateRequest.count({ where: { status: "Rejected" } }),
      prisma.certificateRequest.count({ where: { status: "Issued" } }),
    ]);
    return { total, pending, approved, rejected, issued };
  },
};
