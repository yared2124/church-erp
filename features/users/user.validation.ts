import { z } from "zod";

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Locked"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().trim().optional(),
  role: z.string().min(1, "Please select a role."),
  status: z.enum(["Active", "Inactive", "Locked"]).default("Active"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").optional(),
  email: z.string().trim().email("Please enter a valid email address.").optional(),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  role: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Locked"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

