import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().nullable().optional(),
  period: z.enum(["daily", "monthly"]),
  limitPaise: z
    .number()
    .int("Limit must be an integer in paise")
    .positive("Limit must be greater than zero"),
  applicablePeriod: z
    .string()
    .min(1, "Applicable period is required")
    .regex(
      /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2})$/,
      "Applicable period must be 'YYYY-MM-DD' for daily or 'YYYY-MM' for monthly"
    ),
  alertThreshold: z.number().int().min(1).max(100).optional().default(80),
});

export const updateBudgetSchema = z.object({
  limitPaise: z.number().int().positive().optional(),
  alertThreshold: z.number().int().min(1).max(100).optional(),
});

export const budgetQuerySchema = z.object({
  period: z.enum(["daily", "monthly"]).optional(),
  applicablePeriod: z.string().optional(),
});
