import { z } from "zod";

export const listInventoryQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().optional(),
  status: z.enum(["InStock", "LowStock", "OutOfStock"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(8),
});

export type ListInventoryQuery = z.infer<typeof listInventoryQuerySchema>;
