export interface FamilySummary {
  id: string;
  name: string;
}

export interface ApiMember {
  id: string;
  familyId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  roleInFamily: "Head" | "Wife" | "Husband" | "Son" | "Daughter";
  status: "Active" | "Inactive" | "Transferred" | "Deceased";
  confessorPriestId: string | null;
  baptizedDate: string | null;
  membershipDate: string;
  createdAt: string;
  family: FamilySummary;
}

export function memberFullName(m: Pick<ApiMember, "firstName" | "lastName">) {
  return `${m.firstName} ${m.lastName}`;
}

export interface MemberStatsResponse {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  genderBreakdown: { gender: "Male" | "Female"; count: number }[];
  ageBreakdown: { group: string; count: number }[];
  recent: ApiMember[];
}
