export interface FamilyMemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  roleInFamily: "Head" | "Wife" | "Husband" | "Son" | "Daughter";
  status: "Active" | "Inactive" | "Transferred" | "Deceased";
}

export type SebekaStatus = "Paid" | "Partial" | "Unpaid" | "Overdue";
export type FamilyStatus = "Active" | "Inactive";

export interface ApiFamily {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  registrationDate: string;
  sebekaStatus: SebekaStatus;
  status: FamilyStatus;
  createdAt: string;
  members: FamilyMemberSummary[];
  _count: { members: number };
}

export interface ApiFamilyPayment {
  id: string;
  familyId: string;
  year: number;
  expectedAmount: string; // Prisma Decimal serializes to a string over JSON
  paidAmount: string;
  paymentDate: string | null;
  paymentMethod: "Cash" | "BankTransfer" | "MobileMoney" | null;
  status: SebekaStatus;
  receiptNumber: string | null;
  receiptUrl: string | null;
  createdAt: string;
}

export interface ApiFamilyDetail extends Omit<ApiFamily, "_count"> {
  familyPayments: ApiFamilyPayment[];
}

/** The one member in `members` whose roleInFamily is "Head", if any. */
export function headOfFamily(family: Pick<ApiFamily, "members">) {
  return family.members.find((m) => m.roleInFamily === "Head") ?? family.members[0] ?? null;
}

export function memberFullName(m: Pick<FamilyMemberSummary, "firstName" | "lastName">) {
  return `${m.firstName} ${m.lastName}`;
}

export interface FamilyStatsResponse {
  total: number;
  active: number;
  outstanding: number;
  sebekaBreakdown: { status: SebekaStatus; count: number }[];
  byYear: { year: string; count: number }[];
}
