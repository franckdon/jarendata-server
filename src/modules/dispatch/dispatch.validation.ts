import { z } from "zod";

export const updateRecipientStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "SENT",
    "DELIVERED",
    "READ",
    "RESPONDED",
    "FAILED",
    "CANCELLED",
  ]),
  errorMessage: z.string().optional(),
});

export type UpdateRecipientStatusInput = z.infer<
  typeof updateRecipientStatusSchema
>;

export type RecipientQuery = {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?:
    | "PENDING"
    | "SENT"
    | "DELIVERED"
    | "READ"
    | "RESPONDED"
    | "FAILED"
    | "CANCELLED";
};