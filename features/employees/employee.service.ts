import { employeeRepository } from "./employee.repository";
import type { ListEmployeesQuery } from "./employee.validation";

export const employeeService = {
  async list(query: ListEmployeesQuery) {
    const { data, total } = await employeeRepository.list(query);
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
    const [stats, byDepartment, byEmploymentType, leaveSummary] = await Promise.all([
      employeeRepository.stats(),
      employeeRepository.byDepartment(),
      employeeRepository.byEmploymentType(),
      employeeRepository.leaveSummary(),
    ]);
    return { ...stats, byDepartment, byEmploymentType, leaveSummary };
  },
};
