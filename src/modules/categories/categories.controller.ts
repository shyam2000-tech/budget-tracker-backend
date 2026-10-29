import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";

export class CategoryController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoryService.getCategories(req.user!.id);
    return sendSuccess(res, categories, "Categories fetched successfully");
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.createCategory(req.user!.id, req.body);
    return sendSuccess(res, category, "Category created successfully", 201);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.updateCategory(
      req.user!.id,
      req.params.id as string,
      req.body
    );
    return sendSuccess(res, category, "Category updated successfully");
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const reassignTo =
      (req.query?.reassignTo as string) || (req.body?.reassignTo as string);
    const result = await CategoryService.deleteCategory(
      req.user!.id,
      req.params.id as string,
      reassignTo
    );
    return sendSuccess(res, result, "Category deleted successfully");
  });
}
