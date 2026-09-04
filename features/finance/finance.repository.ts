import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListTransactionsQuery } from "./finance.validation";

export const financeRepository = {
  async listTransactions(query: ListTransactionsQuery) {
    const where: Prisma.TransactionWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.category && { category: { name: query.category } }),
      ...(query.search && {
        description: { contains: query.search, mode: "insensitive" },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, createdBy: true },
        orderBy: { transactionDate: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  },

  async overview() {
    const [incomeRows, expenseRows, pendingApprovals, account] = await Promise.all([
      prisma.transaction.aggregate({ where: { type: "Income" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { type: "Expense" }, _sum: { amount: true } }),
      prisma.transaction.count({ where: { status: "Pending" } }),
      prisma.financeAccount.findFirst({ orderBy: { createdAt: "asc" } }),
    ]);

    const totalIncome = Number(incomeRows._sum.amount ?? 0);
    const totalExpenses = Number(expenseRows._sum.amount ?? 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCollections = await prisma.transaction.aggregate({
      where: { type: "Income", transactionDate: { gte: monthStart } },
      _sum: { amount: true },
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance: Number(account?.currentBalance ?? totalIncome - totalExpenses),
      pendingApprovals,
      thisMonthCollections: Number(thisMonthCollections._sum.amount ?? 0),
      openingBalance: Number(account?.openingBalance ?? 0),
    };
  },

  async byCategory(type: "Income" | "Expense") {
    type GroupRow = { categoryId: string; _sum: { amount: unknown } };
    const rows: GroupRow[] = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { type },
      _sum: { amount: true },
    });
    const categories = await prisma.transactionCategory.findMany({
      where: { id: { in: rows.map((r: GroupRow) => r.categoryId) } },
    });
    const categoryMap = new Map<string, string>(
      categories.map((c: { id: string; name: string }): [string, string] => [c.id, c.name])
    );
    const total = rows.reduce((sum: number, r: GroupRow) => sum + Number(r._sum.amount ?? 0), 0);

    return rows
      .map((r: GroupRow) => {
        const value = Number(r._sum.amount ?? 0);
        return {
          label: categoryMap.get(r.categoryId) ?? "Unknown",
          value,
          pct: total > 0 ? `${((value / total) * 100).toFixed(0)}%` : "0%",
        };
      })
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value);
  },

  async monthlyTrend() {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const rows = await prisma.transaction.findMany({
      where: { transactionDate: { gte: yearStart } },
      select: { type: true, amount: true, transactionDate: true },
    });

    const buckets = new Map<string, { income: number; expenses: number }>();
    for (const r of rows) {
      const key = r.transactionDate.toLocaleDateString("en-US", { month: "short" });
      const bucket = buckets.get(key) ?? { income: 0, expenses: 0 };
      if (r.type === "Income") bucket.income += Number(r.amount);
      else bucket.expenses += Number(r.amount);
      buckets.set(key, bucket);
    }

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthOrder
      .filter((m) => buckets.has(m))
      .map((m) => ({ month: m, ...buckets.get(m)! }));
  },
};
