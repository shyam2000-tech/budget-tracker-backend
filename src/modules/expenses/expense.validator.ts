import { z } from "zod";

export const createExpenseSchema = z.object({
  amountPaise: z
    .number()
    .int("Amount must be an integer in paise")
    .positive("Amount must be greater than zero"),
  categoryId: z.string().min(1, "Category ID is required"),
  description: z.string().max(255).optional().default(""),
  type: z.enum(["expense", "income"]).optional().default("expense"),
  date: z.string().or(z.date()).optional(),
  paymentMethod: z.string().max(50).optional().default("upi"),
});

export const updateExpenseSchema = z.object({
  amountPaise: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  description: z.string().max(255).optional(),
  type: z.enum(["expense", "income"]).optional(),
  date: z.string().or(z.date()).optional(),
  paymentMethod: z.string().max(50).optional(),
});

export const expenseQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["expense", "income"]).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional().default("1"),
  limit: z.string().regex(/^\d+$/).optional().default("20"),
  sortBy: z.enum(["date", "amountPaise", "createdAt"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
