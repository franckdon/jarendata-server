"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCampaignMessagesSchema = exports.upsertPlatformMessagingAccountSchema = exports.upsertCompanyMessagingAccountSchema = void 0;
const zod_1 = require("zod");
exports.upsertCompanyMessagingAccountSchema = zod_1.z.object({
    provider: zod_1.z.enum(["META", "TWILIO", "MOCK"]).optional(),
    name: zod_1.z.string().min(2).optional(),
    phoneNumberId: zod_1.z.string().optional(),
    businessAccountId: zod_1.z.string().optional(),
    accessToken: zod_1.z.string().optional(),
    webhookVerifyToken: zod_1.z.string().optional(),
    fromPhoneNumber: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.upsertPlatformMessagingAccountSchema = zod_1.z.object({
    provider: zod_1.z.enum(["META", "TWILIO", "MOCK"]).optional(),
    name: zod_1.z.string().min(2).optional(),
    phoneNumberId: zod_1.z.string().optional(),
    businessAccountId: zod_1.z.string().optional(),
    accessToken: zod_1.z.string().optional(),
    webhookVerifyToken: zod_1.z.string().optional(),
    fromPhoneNumber: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.sendCampaignMessagesSchema = zod_1.z.object({
    limit: zod_1.z.number().int().positive().max(100).optional(),
});
