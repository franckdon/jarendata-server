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

export const updateMeSchema = z
  .object({
    fullName: z.string().min(2, "Le nom complet est obligatoire").optional(),
    email: z.string().email("Email invalide").optional(),

    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.newPassword && !data.confirmPassword) return true;
      return data.newPassword === data.confirmPassword;
    },
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => {
      if (!data.newPassword) return true;
      return !!data.currentPassword;
    },
    {
      message: "Le mot de passe actuel est obligatoire",
      path: ["currentPassword"],
    },
  );

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;