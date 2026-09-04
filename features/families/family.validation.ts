import { z } from "zod";

export const createFamilySchema = z.object({
  name: z.string().trim().min(1, "Family name is required."),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  registrationDate: z.coerce.date().default(() => new Date()),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const updateFamilySchema = createFamilySchema.partial();

export const listFamiliesQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  sebekaStatus: z.enum(["Paid", "Partial", "Unpaid", "Overdue"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;
export type ListFamiliesQuery = z.infer<typeof listFamiliesQuerySchema>;
