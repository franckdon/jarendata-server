import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().min(2, "Le nom de la campagne est obligatoire"),
  description: z.string().optional(),

  type: z
    .enum([
      "CUSTOMER_SATISFACTION",
      "NPS",
      "PRODUCT_FEEDBACK",
      "PRICE_TEST",
      "MARKET_RESEARCH",
      "CUSTOMER_RETENTION",
      "CUSTOM",
    ])
    .optional(),

  targetAllContacts: z.boolean().optional(),

  countryFilter: z.string().optional(),
  cityFilter: z.string().optional(),
  tagsFilter: z.array(z.string()).optional(),

  scheduledAt: z.string().datetime().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const updateCampaignStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SCHEDULED",
    "RUNNING",
    "PAUSED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type UpdateCampaignStatusInput = z.infer<typeof updateCampaignStatusSchema>;

export type CampaignQuery = {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "COMPLETED" | "CANCELLED";
  type?:
    | "CUSTOMER_SATISFACTION"
    | "NPS"
    | "PRODUCT_FEEDBACK"
    | "PRICE_TEST"
    | "MARKET_RESEARCH"
    | "CUSTOMER_RETENTION"
    | "CUSTOM";
};