import { z } from "zod";

const phoneRegex = /^0\d{9}$/;

export const createMemberSchema = z.object({
  familyId: z.string().min(1, "Please select a family."),
  firstName: z.string().trim().min(1, "First name is required."),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required."),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Date of birth cannot be in the future.",
  }),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid 10-digit phone number (e.g. 0911345678).")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  address: z.string().trim().optional(),
  roleInFamily: z.enum(["Head", "Wife", "Husband", "Son", "Daughter"]),
  status: z.enum(["Active", "Inactive", "Transferred", "Deceased"]).default("Active"),
  confessorPriestId: z.string().optional(),
  baptizedDate: z.coerce.date().optional(),
  membershipDate: z.coerce.date().default(() => new Date()),
});

export const updateMemberSchema = createMemberSchema.partial();

export const listMembersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["Active", "Inactive", "Transferred", "Deceased"]).optional(),
  roleInFamily: z.enum(["Head", "Wife", "Husband", "Son", "Daughter"]).optional(),
  familyId: z.string().optional(),
  confessorPriestId: z.string().optional(),
  sebekaStatus: z.enum(["Paid", "Partial", "Unpaid", "Overdue"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;

export interface MemberFormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  familyId: string;
  roleInFamily: string;
  isHeadOfFamily: boolean;
  baptismStatus: string;
  membershipStatus: string;
  registrationDate: string;
  confessorPriest: string;
  confessorPriestId?: string;
  notes: string;
}

export type MemberFormErrors = Partial<Record<keyof MemberFormValues, string>>;

const PHONE_REGEX = /^0\d{9}$/; // e.g. 0911345678

/** Validates the Add/Edit Member form. Returns a map of field → error message. */
export function validateMemberForm(values: MemberFormValues): MemberFormErrors {
  const errors: MemberFormErrors = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.gender) errors.gender = "Please select a gender.";

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else if (new Date(values.dateOfBirth) > new Date()) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  }

  if (values.phone && !PHONE_REGEX.test(values.phone.replace(/\s+/g, ""))) {
    errors.phone = "Enter a valid 10-digit phone number (e.g. 0911345678).";
  }

  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.familyId) errors.familyId = "Please select a family.";
  if (!values.roleInFamily) errors.roleInFamily = "Please select the relationship to the head.";

  if (!values.membershipStatus) errors.membershipStatus = "Please select a membership status.";
  if (!values.registrationDate) errors.registrationDate = "Registration date is required.";

  return errors;
}

export function hasErrors(errors: MemberFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
