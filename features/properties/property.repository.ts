import { prisma } from "@/lib/prisma";

export const propertyRepository = {
  async stats() {
    const [totalHouses, occupied, activeLeases, overdue, activeTenants] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: "Occupied" } }),
      prisma.leaseAgreement.findMany({ where: { status: "Active" }, select: { monthlyRent: true } }),
      prisma.rentPayment.findMany({ where: { status: "Overdue" }, select: { amount: true } }),
      prisma.leaseAgreement.count({ where: { status: "Active" } }),
    ]);

    const monthlyRentIncome = activeLeases.reduce((sum: number, l: { monthlyRent: unknown }) => sum + Number(l.monthlyRent), 0);
    const overdueAmount = overdue.reduce((sum: number, p: { amount: unknown }) => sum + Number(p.amount), 0);

    return {
      totalHouses,
      occupied,
      occupancyRate: totalHouses > 0 ? `${Math.round((occupied / totalHouses) * 100)}%` : "0%",
      monthlyRentIncome,
      overdueAmount,
      activeTenants,
    };
  },

  recentRentPayments(limit = 5) {
    return prisma.rentPayment.findMany({
      where: { status: "Paid" },
      include: { leaseAgreement: { include: { tenant: true, property: true } } },
      orderBy: { paymentDate: "desc" },
      take: limit,
    });
  },

  activeTenants(limit = 5) {
    return prisma.leaseAgreement.findMany({
      where: { status: "Active" },
      include: { tenant: true, property: true },
      orderBy: { endDate: "asc" },
      take: limit,
    });
  },

  overdueRentals(limit = 5) {
    return prisma.rentPayment.findMany({
      where: { status: "Overdue" },
      include: { leaseAgreement: { include: { tenant: true, property: true } } },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  },

  async propertiesByType() {
    const rows = await prisma.property.groupBy({ by: ["type"], _count: true });
    const total = rows.reduce((s: number, r: { _count: number }) => s + r._count, 0);
    return rows.map((r: { type: string; _count: number }) => ({
      label: r.type,
      value: r._count,
      pct: total > 0 ? `${((r._count / total) * 100).toFixed(1)}%` : "0%",
    }));
  },

  async rentStatusBreakdown() {
    const [paid, pending, overdue, vacant] = await Promise.all([
      prisma.rentPayment.count({ where: { status: "Paid" } }),
      prisma.rentPayment.count({ where: { status: "Pending" } }),
      prisma.rentPayment.count({ where: { status: "Overdue" } }),
      prisma.property.count({ where: { status: "Vacant" } }),
    ]);
    const total = paid + pending + overdue + vacant || 1;
    return [
      { label: "Paid", count: paid, value: Math.round((paid / total) * 100), color: "#16A34A" },
      { label: "Pending", count: pending, value: Math.round((pending / total) * 100), color: "#F59E0B" },
      { label: "Overdue", count: overdue, value: Math.round((overdue / total) * 100), color: "#EF4444" },
      { label: "Vacant", count: vacant, value: Math.round((vacant / total) * 100), color: "#94A3B8" },
    ];
  },

  maintenanceSummary() {
    return prisma.maintenanceRequest.groupBy({ by: ["status", "priority"], _count: true });
  },
};
