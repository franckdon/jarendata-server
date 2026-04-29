import { z } from "zod";

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  country: z.string().min(2).optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional(),
});

export const updateCompanyStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DISABLED"]),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateCompanyStatusInput = z.infer<typeof updateCompanyStatusSchema>;