"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTemplateSchema = exports.updateOptionNextQuestionSchema = exports.reorderQuestionsSchema = exports.updateSurveyQuestionSchema = exports.createSurveyQuestionSchema = exports.createSurveyOptionSchema = void 0;
const zod_1 = require("zod");
exports.createSurveyOptionSchema = zod_1.z.object({
    label: zod_1.z.string().min(1, "Le libellé est obligatoire"),
    value: zod_1.z.string().min(1, "La valeur est obligatoire"),
    order: zod_1.z.number().int().min(1),
    nextQuestionId: zod_1.z.string().uuid().optional().nullable(),
});
exports.createSurveyQuestionSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, "La question est obligatoire"),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(["TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RATING", "YES_NO"]),
    order: zod_1.z.number().int().min(1),
    isRequired: zod_1.z.boolean().optional(),
    placeholder: zod_1.z.string().optional(),
    minValue: zod_1.z.number().int().optional(),
    maxValue: zod_1.z.number().int().optional(),
    options: zod_1.z.array(exports.createSurveyOptionSchema).optional(),
});
exports.updateSurveyQuestionSchema = exports.createSurveyQuestionSchema.partial();
exports.reorderQuestionsSchema = zod_1.z.object({
    questions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        order: zod_1.z.number().int().min(1),
    })),
});
exports.updateOptionNextQuestionSchema = zod_1.z.object({
    nextQuestionId: zod_1.z.string().uuid().nullable(),
});
exports.applyTemplateSchema = zod_1.z.object({
    templateKey: zod_1.z.enum([
        "CUSTOMER_SATISFACTION",
        "PRICE_TEST",
        "MARKET_RESEARCH",
        "PRODUCT_FEEDBACK",
        "CUSTOMER_RETENTION",
        "NPS",
        "BUSINESS_IDEA_VALIDATION",
    ]),
});
