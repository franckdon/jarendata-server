import { z } from "zod";

export const upsertCompanyMessagingAccountSchema = z.object({
  provider: z.enum(["META", "TWILIO", "MOCK"]).optional(),
  name: z.string().min(2).optional(),

  phoneNumberId: z.string().optional(),
  businessAccountId: z.string().optional(),
  accessToken: z.string().optional(),
  webhookVerifyToken: z.string().optional(),
  fromPhoneNumber: z.string().optional(),

  isActive: z.boolean().optional(),
});

export const upsertPlatformMessagingAccountSchema = z.object({
  provider: z.enum(["META", "TWILIO", "MOCK"]).optional(),
  name: z.string().min(2).optional(),

  phoneNumberId: z.string().optional(),
  businessAccountId: z.string().optional(),
  accessToken: z.string().optional(),
  webhookVerifyToken: z.string().optional(),
  fromPhoneNumber: z.string().optional(),

  isActive: z.boolean().optional(),
});

export const sendCampaignMessagesSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
});

export type UpsertCompanyMessagingAccountInput = z.infer<
  typeof upsertCompanyMessagingAccountSchema
>;

export type UpsertPlatformMessagingAccountInput = z.infer<
  typeof upsertPlatformMessagingAccountSchema
>;

export type SendCampaignMessagesInput = z.infer<
  typeof sendCampaignMessagesSchema
>;