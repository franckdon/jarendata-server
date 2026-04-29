import { z } from "zod";

export const createSurveyOptionSchema = z.object({
  label: z.string().min(1, "Le libellé est obligatoire"),
  value: z.string().min(1, "La valeur est obligatoire"),
  order: z.number().int().min(1),
  nextQuestionId: z.string().uuid().optional().nullable(),
});

export const createSurveyQuestionSchema = z.object({
  title: z.string().min(2, "La question est obligatoire"),
  description: z.string().optional(),
  type: z.enum(["TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RATING", "YES_NO"]),
  order: z.number().int().min(1),
  isRequired: z.boolean().optional(),
  placeholder: z.string().optional(),
  minValue: z.number().int().optional(),
  maxValue: z.number().int().optional(),
  options: z.array(createSurveyOptionSchema).optional(),
});

export const updateSurveyQuestionSchema = createSurveyQuestionSchema.partial();

export const reorderQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(1),
    })
  ),
});

export const updateOptionNextQuestionSchema = z.object({
  nextQuestionId: z.string().uuid().nullable(),
});

export const applyTemplateSchema = z.object({
  templateKey: z.enum([
    "CUSTOMER_SATISFACTION",
    "PRICE_TEST",
    "MARKET_RESEARCH",
    "PRODUCT_FEEDBACK",
    "CUSTOMER_RETENTION",
    "NPS",
    "BUSINESS_IDEA_VALIDATION",
  ]),
});

export type CreateSurveyQuestionInput = z.infer<typeof createSurveyQuestionSchema>;
export type UpdateSurveyQuestionInput = z.infer<typeof updateSurveyQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
export type UpdateOptionNextQuestionInput = z.infer<typeof updateOptionNextQuestionSchema>;
export type ApplyTemplateInput = z.infer<typeof applyTemplateSchema>;