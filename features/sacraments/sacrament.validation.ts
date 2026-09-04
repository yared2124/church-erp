import { z } from "zod";

export const listSacramentsQuerySchema = z.object({
  type: z.enum(["Baptism", "Marriage", "Burial"]),
  search: z.string().trim().optional(),
  status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
  priestId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListSacramentsQuery = z.infer<typeof listSacramentsQuerySchema>;
