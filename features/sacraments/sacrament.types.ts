export type SacramentType = "Baptism" | "Marriage" | "Burial";
export type SacramentStatus = "Pending" | "Approved" | "Rejected";

export interface SacramentMemberRef {
  id: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
}

export interface SacramentSponsor {
  id: string;
  name: string;
  relation: string;
}

export interface ApiSacrament {
  id: string;
  type: SacramentType;
  date: string;
  church: string;
  status: SacramentStatus;
  notes: string | null;
  createdAt: string;
  primaryMember: SacramentMemberRef;
  secondaryMember: SacramentMemberRef | null;
  family: { id: string; name: string } | null;
  priest: { id: string; name: string } | null;
  registeredBy: { id: string; name: string };
  sponsors: SacramentSponsor[];
}

export interface SacramentStatsResponse {
  total: number;
  male: number;
  female: number;
  approved: number;
  pending: number;
  thisYear: number;
  lastYear: number;
  mostActiveMonth: string;
  topPriest: string;
  topChurch: string;
  priests: { id: string; name: string }[];
}

export function memberName(m: SacramentMemberRef) {
  return `${m.firstName} ${m.lastName}`;
}

export function sacramentTitle(s: ApiSacrament) {
  return s.secondaryMember
    ? `${memberName(s.primaryMember)} & ${memberName(s.secondaryMember)}`
    : memberName(s.primaryMember);
}
