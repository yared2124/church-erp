import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { auditLogRepository, requestMetadata } from "@/features/audit-logs/audit-log.repository";

const sacramentRequestSchema = z.object({
  type: z.enum(["Baptism", "Marriage", "Burial"]),
  primaryMemberId: z.string().min(1, "Primary member is required"),
  secondaryMemberId: z.string().optional(),
  date: z.coerce.date(),
  church: z.string().default("St. Mary Church"),
  notes: z.string().optional(),
  sponsors: z
    .array(
      z.object({
        name: z.string().min(1),
        relation: z.string().min(1),
      })
    )
    .optional(),
});

export const GET = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const isPriest = user.roles.includes("Priest") && !user.roles.includes("Super Admin");

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status") as "Pending" | "Approved" | "Rejected" | null;
  const typeParam = url.searchParams.get("type") as "Baptism" | "Marriage" | "Burial" | null;

  const where: any = {
    ...(isPriest && { priestId: user.id }),
    ...(statusParam && { status: statusParam }),
    ...(typeParam && { type: typeParam }),
  };

  const requests = await prisma.sacrament.findMany({
    where,
    include: {
      primaryMember: { select: { id: true, firstName: true, lastName: true, phone: true } },
      secondaryMember: { select: { id: true, firstName: true, lastName: true, phone: true } },
      priest: { select: { id: true, name: true } },
      registeredBy: { select: { id: true, name: true } },
      sponsors: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: requests });
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const isPriest = user.roles.includes("Priest");
  const isAdmin = user.roles.includes("Super Admin");

  if (!isPriest && !isAdmin) {
    throw new ApiError(403, "Only priests or administrators may submit sacrament requests.");
  }

  const body = await req.json();
  const parsed = sacramentRequestSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(422, parsed.error.issues.map((i) => i.message).join(" "));
  }

  const member = await prisma.member.findUnique({
    where: { id: parsed.data.primaryMemberId },
    select: { id: true, familyId: true, firstName: true, lastName: true, confessorPriestId: true },
  });

  if (!member) {
    throw new ApiError(404, "Spiritual child / member not found.");
  }

  if (isPriest && !isAdmin && member.confessorPriestId && member.confessorPriestId !== user.id) {
    throw new ApiError(403, "You may only submit sacrament requests for your own spiritual children.");
  }

  const priestId = isPriest ? user.id : (member.confessorPriestId || user.id);

  const created = await prisma.sacrament.create({
    data: {
      type: parsed.data.type,
      primaryMemberId: parsed.data.primaryMemberId,
      secondaryMemberId: parsed.data.secondaryMemberId || null,
      familyId: member.familyId || null,
      date: parsed.data.date,
      church: parsed.data.church || "St. Mary Church",
      status: "Pending",
      notes: parsed.data.notes || null,
      priestId,
      registeredById: user.id,
      ...(parsed.data.sponsors && parsed.data.sponsors.length > 0 && {
        sponsors: {
          create: parsed.data.sponsors.map((s) => ({
            name: s.name,
            relation: s.relation,
          })),
        },
      }),
    },
    include: {
      primaryMember: true,
      secondaryMember: true,
      priest: true,
      sponsors: true,
    },
  });

  await auditLogRepository.record({
    userId: user.id,
    action: "CREATE",
    entity: "SacramentRequest",
    entityId: created.id,
    status: "Success",
    description: "Submitted " + created.type + " request for " + member.firstName + " " + member.lastName,
    ...requestMetadata(req),
  });

  return NextResponse.json({ data: created }, { status: 201 });
});

export const PATCH = withErrorHandling(async (req) => {
  const user = await requireRole("Super Admin");

  const body = await req.json();
  const { id, status, notes } = body;

  if (!id || !["Approved", "Rejected"].includes(status)) {
    throw new ApiError(400, "Valid request ID and status are required.");
  }

  const updated = await prisma.sacrament.update({
    where: { id },
    data: {
      status,
      ...(notes && { notes }),
    },
    include: {
      primaryMember: true,
      priest: true,
    },
  });

  await auditLogRepository.record({
    userId: user.id,
    action: "UPDATE",
    entity: "SacramentRequest",
    entityId: updated.id,
    status: "Success",
    description: status + " " + updated.type + " request for " + updated.primaryMember.firstName + " " + updated.primaryMember.lastName,
    ...requestMetadata(req),
  });

  return NextResponse.json({ data: updated });
});