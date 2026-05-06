"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSurveySessionSchema = exports.submitAnswerSchema = exports.startSurveySessionSchema = void 0;
const zod_1 = require("zod");
exports.startSurveySessionSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid(),
    contactId: zod_1.z.string().uuid(),
    recipientId: zod_1.z.string().uuid().optional(),
});
exports.submitAnswerSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid(),
    contactId: zod_1.z.string().uuid(),
    questionId: zod_1.z.string().uuid(),
    optionId: zod_1.z.string().uuid().optional().nullable(),
    answerType: zod_1.z.enum(["TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RATING", "YES_NO"]),
    textValue: zod_1.z.string().optional(),
    numberValue: zod_1.z.number().optional(),
    booleanValue: zod_1.z.boolean().optional(),
    values: zod_1.z.array(zod_1.z.string()).optional(),
    rawValue: zod_1.z.string().optional(),
});
exports.completeSurveySessionSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid(),
    contactId: zod_1.z.string().uuid(),
});
