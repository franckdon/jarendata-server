import { z } from "zod";

export const createContactSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  phone: z.string().min(6, "Le numéro de téléphone est obligatoire"),
  email: z.string().email("Email invalide").optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  gender: z.string().optional(),
  ageRange: z.string().optional(),
  externalId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  source: z.enum(["MANUAL", "IMPORT", "API", "WHATSAPP_OPT_IN"]).optional(),
  consentStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
  consentText: z.string().optional(),
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
  externalId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  source: z.enum(["MANUAL", "IMPORT", "API", "WHATSAPP_OPT_IN"]).optional(),
  consentStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
  consentText: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const importContactsSchema = z.object({
  contacts: z.array(createContactSchema).min(1, "La liste de contacts est vide"),
  consentStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
  defaultTags: z.array(z.string()).optional(),
});

export const syncContactSchema = z.object({
  externalId: z.string().min(1, "L'identifiant externe est obligatoire"),
  fullName: z.string().optional(),
  phone: z.string().min(6, "Le numéro de téléphone est obligatoire"),
  email: z.string().email("Email invalide").optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  gender: z.string().optional(),
  ageRange: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  consentStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
});

export const optInContactSchema = z.object({
  companySlug: z.string().min(2, "Entreprise invalide"),
  fullName: z.string().min(2).optional(),
  phone: z.string().min(6, "Le numéro de téléphone est obligatoire"),
  email: z.string().email("Email invalide").optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  consentText: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ImportContactsInput = z.infer<typeof importContactsSchema>;
export type SyncContactInput = z.infer<typeof syncContactSchema>;
export type OptInContactInput = z.infer<typeof optInContactSchema>;

export type ContactQuery = {
  page?: string | number;
  limit?: string | number;
  search?: string;
  source?: "MANUAL" | "IMPORT" | "API" | "WHATSAPP_OPT_IN";
  consentStatus?: "PENDING" | "ACCEPTED" | "REJECTED";
  country?: string;
  city?: string;
};