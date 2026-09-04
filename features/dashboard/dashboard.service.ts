import { prisma } from "@/lib/prisma";
import { memberService } from "@/features/members/member.service";
import { financeService } from "@/features/finance/finance.service";
import { certificateService } from "@/features/certificates/certificate.service";
import { familyPaymentService } from "@/features/family-payments/family-payment.service";

export const dashboardService = {
  async overview() {
    const [memberStats, financeOverview, certStats, sebekaStats, overdueRentPaymentsList, recentTransactions, sacramentCounts, pendingExpenses, pendingCertRequests] = await Promise.all([
      memberService.stats(),
      financeService.overview(),
      certificateService.stats(),
      familyPaymentService.stats(),
      prisma.rentPayment.findMany({
        where: { status: "Overdue" },
        include: { leaseAgreement: { include: { tenant: true, property: true } } },
        take: 5,
      }),
      prisma.transaction.findMany({
        include: { category: true },
        orderBy: { transactionDate: "desc" },
        take: 5,
      }),
      prisma.sacrament.groupBy({
        by: ["type"],
        where: { date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        _count: true,
      }),
      prisma.transaction.findMany({
        where: { type: "Expense", status: "Pending" },
        include: { createdBy: true },
        orderBy: { transactionDate: "desc" },
        take: 3,
      }),
      prisma.certificateRequest.findMany({
        where: { status: "Pending" },
        include: { member: true, requestedBy: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const sacramentsByType = { Baptism: 0, Marriage: 0, Burial: 0 };
    for (const row of sacramentCounts as { type: "Baptism" | "Marriage" | "Burial"; _count: number }[]) {
      sacramentsByType[row.type] = row._count;
    }

    return {
      totalMembers: memberStats.total,
      sebekaFamiliesPaid: sebekaStats.familiesPaid,
      totalIncome: financeOverview.totalIncome,
      totalExpenses: financeOverview.totalExpenses,
      netBalance: financeOverview.netBalance,
      pendingCertificateRequests: certStats.pending,
      overdueRentPayments: overdueRentPaymentsList,
      recentTransactions,
      sacramentsByType,
      monthlyTrend: financeOverview.monthlyTrend,
      pendingExpenses,
      pendingCertRequests,
    };
  },
};
