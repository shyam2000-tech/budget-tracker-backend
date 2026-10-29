import { Request, Response } from "express";
import { BudgetService } from "./budget.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";

export class BudgetController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const budget = await BudgetService.createBudget(req.user!.id, req.body);
    return sendSuccess(res, budget, "Budget limit created successfully", 201);
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const tzOffset = req.headers["x-timezone-offset"]
      ? parseInt(req.headers["x-timezone-offset"] as string, 10)
      : 0;

    const budgets = await BudgetService.getBudgetsWithProgress(
      req.user!.id,
      {
        period: req.query.period as any,
        applicablePeriod: req.query.applicablePeriod as string,
      },
      tzOffset
    );

    return sendSuccess(res, budgets, "Budgets retrieved successfully");
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const budget = await BudgetService.updateBudget(
      req.user!.id,
      req.params.id as string,
      req.body
    );
    return sendSuccess(res, budget, "Budget updated successfully");
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const result = await BudgetService.deleteBudget(
      req.user!.id,
      req.params.id as string
    );
    return sendSuccess(res, result, "Budget deleted successfully");
  });
}

