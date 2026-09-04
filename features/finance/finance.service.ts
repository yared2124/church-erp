import { financeRepository } from "./finance.repository";
import type { ListTransactionsQuery } from "./finance.validation";

export const financeService = {
  async listTransactions(query: ListTransactionsQuery) {
    const { data, total } = await financeRepository.listTransactions(query);
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

  async overview() {
    const [overview, incomeByCategory, expenseByCategory, monthlyTrend] = await Promise.all([
      financeRepository.overview(),
      financeRepository.byCategory("Income"),
      financeRepository.byCategory("Expense"),
      financeRepository.monthlyTrend(),
    ]);
    return { ...overview, incomeByCategory, expenseByCategory, monthlyTrend };
  },
};
