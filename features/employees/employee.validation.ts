import { z } from "zod";

export const listEmployeesQuerySchema = z.object({
  search: z.string().trim().optional(),
  department: z.string().optional(),
  status: z.enum(["Active", "OnLeave", "Departed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(5),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
