import { propertyRepository } from "./property.repository";

export const propertyService = {
  async overview() {
    const [stats, recentRentPayments, activeLeases, overdueRentals, propertiesByType, rentStatusOverview, maintenanceRows] = await Promise.all([
      propertyRepository.stats(),
      propertyRepository.recentRentPayments(),
      propertyRepository.activeTenants(),
      propertyRepository.overdueRentals(),
      propertyRepository.propertiesByType(),
      propertyRepository.rentStatusBreakdown(),
      propertyRepository.maintenanceSummary(),
    ]);

    type MaintRow = { status: string; priority: string; _count: number };
    const rows = maintenanceRows as MaintRow[];
    const maintenance = {
      open: rows.filter((r) => r.status !== "Completed").reduce((s, r) => s + r._count, 0),
      urgent: rows.filter((r) => r.priority === "Urgent" && r.status !== "Completed").reduce((s, r) => s + r._count, 0),
      inProgress: rows.filter((r) => r.status === "InProgress").reduce((s, r) => s + r._count, 0),
      scheduled: rows.filter((r) => r.status === "Scheduled").reduce((s, r) => s + r._count, 0),
    };

    return { ...stats, recentRentPayments, activeLeases, overdueRentals, propertiesByType, rentStatusOverview, maintenance };
  },
};
