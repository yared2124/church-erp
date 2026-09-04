import { z } from "zod";

export const listCertificatesQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(["Baptism", "Marriage", "Burial"]).optional(),
  status: z.enum(["Pending", "Approved", "Rejected", "Issued"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListCertificatesQuery = z.infer<typeof listCertificatesQuerySchema>;
