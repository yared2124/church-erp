import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListEmployeesQuery } from "./employee.validation";

export const employeeRepository = {
  async list(query: ListEmployeesQuery) {
    const where: Prisma.EmployeeWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.department && { department: query.department }),
      ...(query.search && { fullName: { contains: query.search, mode: "insensitive" } }),
    };

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { joinDate: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return { data, total };
  },

  async stats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, onLeave, newHires] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "Active" } }),
      prisma.employee.count({ where: { status: "OnLeave" } }),
      prisma.employee.count({ where: { joinDate: { gte: monthStart } } }),
    ]);

    return { total, active, onLeave, newHires };
  },

  async byDepartment() {
    const rows = await prisma.employee.groupBy({ by: ["department"], _count: true });
    const total = rows.reduce((s: number, r: { _count: number }) => s + r._count, 0);
    return rows
      .map((r: { department: string; _count: number }) => ({
        label: r.department,
        value: r._count,
        pct: total > 0 ? `${((r._count / total) * 100).toFixed(1)}%` : "0%",
      }))
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value);
  },

  async byEmploymentType() {
    const rows = await prisma.employee.groupBy({ by: ["employmentType"], _count: true });
    const total = rows.reduce((s: number, r: { _count: number }) => s + r._count, 0);
    return rows.map((r: { employmentType: string; _count: number }) => ({
      label: r.employmentType,
      value: r._count,
      pct: total > 0 ? `${((r._count / total) * 100).toFixed(1)}%` : "0%",
    }));
  },

  async leaveSummary() {
    const [totalRequests, approved, pending, rejected] = await Promise.all([
      prisma.leaveRequest.count(),
      prisma.leaveRequest.count({ where: { status: "Approved" } }),
      prisma.leaveRequest.count({ where: { status: "Pending" } }),
      prisma.leaveRequest.count({ where: { status: "Rejected" } }),
    ]);
    return { totalRequests, approved, pending, rejected };
  },
};
