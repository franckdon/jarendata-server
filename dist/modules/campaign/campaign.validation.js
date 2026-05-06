"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignStatusSchema = exports.updateCampaignSchema = exports.createCampaignSchema = void 0;
const zod_1 = require("zod");
exports.createCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Le nom de la campagne est obligatoire"),
    description: zod_1.z.string().optional(),
    type: zod_1.z
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
    targetAllContacts: zod_1.z.boolean().optional(),
    countryFilter: zod_1.z.string().optional(),
    cityFilter: zod_1.z.string().optional(),
    tagsFilter: zod_1.z.array(zod_1.z.string()).optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
});
exports.updateCampaignSchema = exports.createCampaignSchema.partial();
exports.updateCampaignStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "DRAFT",
        "SCHEDULED",
        "RUNNING",
        "PAUSED",
        "COMPLETED",
        "CANCELLED",
    ]),
});
