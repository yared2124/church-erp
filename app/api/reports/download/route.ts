import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ReportType = "Financial" | "Members" | "Sacraments" | "Property" | "Inventory" | "Employees" | "Custom";

// ── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  // Wrap in quotes if the value contains commas, quotes, or newlines
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\r\n");
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

// ── Per-type data fetchers ────────────────────────────────────────────────────

async function buildFinancialCsv(): Promise<string> {
  const rows = await prisma.transaction.findMany({
    include: { category: true, createdBy: true },
    orderBy: { transactionDate: "desc" },
    take: 500,
  });
  return toCsv(
    ["Date", "Type", "Category", "Description", "Amount (ETB)", "Payment Method", "Status", "Created By"],
    rows.map((r) => [
      fmtDate(r.transactionDate),
      r.type,
      r.category.name,
      r.description,
      Number(r.amount).toFixed(2),
      r.paymentMethod,
      r.status,
      r.createdBy.name,
    ])
  );
}

async function buildMembersCsv(): Promise<string> {
  const rows = await prisma.member.findMany({
    include: { family: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
  return toCsv(
    ["First Name", "Middle Name", "Last Name", "Gender", "Date of Birth", "Role in Family", "Family", "Status", "Membership Date"],
    rows.map((r) => [
      r.firstName,
      r.middleName ?? "",
      r.lastName,
      r.gender,
      fmtDate(r.dateOfBirth),
      r.roleInFamily,
      r.family.name,
      r.status,
      fmtDate(r.membershipDate),
    ])
  );
}

async function buildSacramentsCsv(): Promise<string> {
  const rows = await prisma.sacrament.findMany({
    include: { primaryMember: true, priest: true },
    orderBy: { date: "desc" },
    take: 500,
  });
  return toCsv(
    ["Date", "Type", "Primary Member", "Priest", "Church", "Status"],
    rows.map((r) => [
      fmtDate(r.date),
      r.type,
      `${r.primaryMember.firstName} ${r.primaryMember.lastName}`,
      r.priest ? r.priest.name : "",
      r.church,
      r.status,
    ])
  );
}

async function buildPropertyCsv(): Promise<string> {
  const rows = await prisma.rentPayment.findMany({
    include: { leaseAgreement: { include: { property: true, tenant: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return toCsv(
    ["Payment Date", "Property", "Tenant", "Amount (ETB)", "Payment Method", "Status"],
    rows.map((r) => [
      fmtDate(r.paymentDate),
      r.leaseAgreement.property.unitName,
      r.leaseAgreement.tenant.name,
      Number(r.amount).toFixed(2),
      r.paymentMethod ?? "",
      r.status,
    ])
  );
}

async function buildInventoryCsv(): Promise<string> {
  const rows = await prisma.inventoryItem.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return toCsv(
    ["Item Name", "Category", "Quantity", "Unit Price (ETB)", "Location", "Status"],
    rows.map((r) => [
      r.name,
      r.category.name,
      r.quantity,
      Number(r.unitPrice).toFixed(2),
      r.location ?? "",
      r.status,
    ])
  );
}

async function buildEmployeesCsv(): Promise<string> {
  const rows = await prisma.employee.findMany({ orderBy: { joinDate: "desc" } });
  return toCsv(
    ["Full Name", "Department", "Position", "Employment Type", "Status", "Join Date"],
    rows.map((r) => [
      r.fullName,
      r.department,
      r.position,
      r.employmentType,
      r.status,
      fmtDate(r.joinDate),
    ])
  );
}

async function buildCustomCsv(): Promise<string> {
  // Custom: summary of all key counts
  const [members, families, transactions, properties, employees] = await Promise.all([
    prisma.member.count(),
    prisma.family.count(),
    prisma.transaction.count(),
    prisma.property.count(),
    prisma.employee.count(),
  ]);
  return toCsv(
    ["Entity", "Total Count"],
    [
      ["Members", members],
      ["Families", families],
      ["Transactions", transactions],
      ["Properties", properties],
      ["Employees", employees],
    ]
  );
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type = (searchParams.get("type") ?? "Financial") as ReportType;
  const format = (searchParams.get("format") ?? "CSV") as "CSV" | "PDF";

  const nameMap: Record<ReportType, string> = {
    Financial: "Financial Overview Report",
    Members: "Member Statistics Report",
    Sacraments: "Sacrament Summary Report",
    Property: "Property & Rentals Report",
    Inventory: "Assets & Inventory Report",
    Employees: "Employee Summary Report",
    Custom: "Church Summary Report",
  };

  // Build CSV content based on type
  let csvContent: string;
  switch (type) {
    case "Members":     csvContent = await buildMembersCsv();    break;
    case "Sacraments":  csvContent = await buildSacramentsCsv(); break;
    case "Property":    csvContent = await buildPropertyCsv();   break;
    case "Inventory":   csvContent = await buildInventoryCsv();  break;
    case "Employees":   csvContent = await buildEmployeesCsv();  break;
    case "Custom":      csvContent = await buildCustomCsv();     break;
    default:            csvContent = await buildFinancialCsv();  break;
  }

  // Save a record to the DB
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  await prisma.generatedReport.create({
    data: {
      name: `${nameMap[type]} – ${monthLabel}`,
      category: type,
      format: "PDF",   // stored as PDF for display; file is CSV
      status: "Completed",
      generatedById: session.user.id,
    },
  });

  // Build a clean filename
  const slug = nameMap[type].replace(/\s+/g, "-").toLowerCase();
  const dateSlug = new Date().toISOString().slice(0, 10);
  const filename = `${slug}-${dateSlug}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
