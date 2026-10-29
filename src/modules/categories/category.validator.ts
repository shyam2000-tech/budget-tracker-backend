import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Invalid hex color format").optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Invalid hex color format").optional(),
});

export const deleteCategoryQuerySchema = z.object({
  reassignTo: z.string().optional(),
});

