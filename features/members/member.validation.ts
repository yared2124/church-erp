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
