import { z } from "zod";

export const startSurveySessionSchema = z.object({
  campaignId: z.string().uuid(),
  contactId: z.string().uuid(),
  recipientId: z.string().uuid().optional(),
});

export const submitAnswerSchema = z.object({
  campaignId: z.string().uuid(),
  contactId: z.string().uuid(),
  questionId: z.string().uuid(),
  optionId: z.string().uuid().optional().nullable(),

  answerType: z.enum(["TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RATING", "YES_NO"]),

  textValue: z.string().optional(),
  numberValue: z.number().optional(),
  booleanValue: z.boolean().optional(),
  values: z.array(z.string()).optional(),
  rawValue: z.string().optional(),
});

export const completeSurveySessionSchema = z.object({
  campaignId: z.string().uuid(),
  contactId: z.string().uuid(),
});

export type StartSurveySessionInput = z.infer<typeof startSurveySessionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type CompleteSurveySessionInput = z.infer<typeof completeSurveySessionSchema>;

export type ResponseQuery = {
  page?: string | number;
  limit?: string | number;
  search?: string;
  questionId?: string;
  contactId?: string;
};