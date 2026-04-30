import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.string().email().optional());

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value || value === "") return undefined;

    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      return `https://${value}`;
    }

    return value;
  })
  .pipe(z.string().url().optional());

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Le nom est obligatoire"),
  email: optionalEmail,
  phone: optionalString,
  website: optionalUrl,
  country: z.string().trim().min(2, "Le pays est obligatoire"),
  city: optionalString,
  address: optionalString,
  industry: optionalString,
  size: z
    .enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"])
    .default("SMALL"),
  status: z
    .enum(["PENDING", "ACTIVE", "SUSPENDED", "DISABLED"])
    .default("PENDING"),
});

export const updateCompanySchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: optionalEmail,
  phone: optionalString,
  website: optionalUrl,
  country: z.string().trim().min(2).optional(),
  city: optionalString,
  address: optionalString,
  industry: optionalString,
  size: z.enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DISABLED"]).optional(),
});

export const updateCompanyStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DISABLED"]),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateCompanyStatusInput = z.infer<
  typeof updateCompanyStatusSchema
>;