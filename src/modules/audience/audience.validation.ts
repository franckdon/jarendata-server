import { z } from "zod";

export const createContactSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  phone: z.string().min(6, "Le numéro de téléphone est obligatoire"),
  email: z.string().email("Email invalide").optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  gender: z.string().optional(),
  ageRange: z.string().optional(),
  source: z.enum(["MANUAL", "IMPORT", "API", "WHATSAPP_OPT_IN"]).optional(),
  consentStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateContactSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),
  email: z.string().email("Email invalide").optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  gender: z.string().optional(),
  ageRange: z.string().optional(),
  source: z.enum(["MANUAL", "IMPORT", "API", "WHATSAPP_OPT_IN"]).optional(),
  consentStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export type ContactQuery = {
  page?: string | number;
  limit?: string | number;
  search?: string;
  source?: "MANUAL" | "IMPORT" | "API" | "WHATSAPP_OPT_IN";
  consentStatus?: "PENDING" | "ACCEPTED" | "REJECTED";
  country?: string;
  city?: string;
};