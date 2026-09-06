"use server";

export type ReportType =
  | "Financial"
  | "Members"
  | "Sacraments"
  | "Property"
  | "Inventory"
  | "Employees"
  | "Custom";

/**
 * Returns the URL for the report download API route.
 * The client uses this to trigger a native browser file download.
 * The API route itself handles auth, data fetching, CSV generation,
 * and saving the GeneratedReport record.
 */
export async function generateReport(
  type: ReportType,
  format: "PDF" | "CSV" = "CSV"
): Promise<string> {
  return `/api/reports/download?type=${type}&format=${format}`;
}
