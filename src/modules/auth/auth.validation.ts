import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est obligatoire"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),

  companyName: z.string().min(2, "Le nom de l'entreprise est obligatoire"),
  companyCountry: z.string().min(2, "Le pays est obligatoire"),
  companyCity: z.string().optional(),
  companyPhone: z.string().optional(),
  companyIndustry: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;