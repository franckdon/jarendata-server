import { z } from "zod";

export const addCreditsSchema = z.object({
  companyId: z.string().uuid("Entreprise invalide"),
  amount: z.number().int().positive("Le montant doit être positif"),
  description: z.string().optional(),
});

export const adjustCreditsSchema = z.object({
  companyId: z.string().uuid("Entreprise invalide"),
  amount: z.number().int(),
  description: z.string().optional(),
});

export type AddCreditsInput = z.infer<typeof addCreditsSchema>;
export type AdjustCreditsInput = z.infer<typeof adjustCreditsSchema>;

export type CreditQuery = {
  page?: string | number;
  limit?: string | number;
  type?: "CREDIT" | "DEBIT" | "REFUND" | "ADJUSTMENT";
  reason?:
    | "INITIAL_BONUS"
    | "ADMIN_TOPUP"
    | "CAMPAIGN_LAUNCH"
    | "CAMPAIGN_REFUND"
    | "MANUAL_ADJUSTMENT";
};