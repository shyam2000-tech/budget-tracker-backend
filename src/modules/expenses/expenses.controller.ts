import { Request, Response } from "express";
import { ExpenseService } from "./expense.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";

export class ExpenseController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const expense = await ExpenseService.createExpense(req.user!.id, req.body);
    return sendSuccess(res, expense, "Expense created successfully", 201);
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await ExpenseService.getExpenses(req.user!.id, req.query as any);
    return sendSuccess(res, result.items, "Expenses retrieved successfully", 200, result.pagination);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const expense = await ExpenseService.getExpenseById(
      req.user!.id,
      req.params.id as string
    );
    return sendSuccess(res, expense, "Expense details retrieved successfully");
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const expense = await ExpenseService.updateExpense(
      req.user!.id,
      req.params.id as string,
      req.body
    );
    return sendSuccess(res, expense, "Expense updated successfully");
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const result = await ExpenseService.deleteExpense(
      req.user!.id,
      req.params.id as string
    );
    return sendSuccess(res, result, "Expense deleted successfully");
  });
}

