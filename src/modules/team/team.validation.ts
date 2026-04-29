import { z } from "zod";

export const createTeamMemberSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est obligatoire"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  companyRole: z.enum(["MANAGER", "ANALYST", "MEMBER"]),
});

export const updateTeamMemberRoleSchema = z.object({
  companyRole: z.enum(["MANAGER", "ANALYST", "MEMBER"]),
});

export const updateTeamMemberStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleSchema>;
export type UpdateTeamMemberStatusInput = z.infer<typeof updateTeamMemberStatusSchema>;