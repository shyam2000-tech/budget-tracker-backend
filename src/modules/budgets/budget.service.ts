import { Types } from "mongoose";
import { Budget } from "./budget.model";
import { Expense } from "../expenses/expense.model";
import { Category } from "../categories/category.model";
import { AppError } from "../../utils/AppError";
import { getDayBoundaries, getMonthBoundaries } from "../../utils/date";
import {
  CreateBudgetDTO,
  UpdateBudgetDTO,
  BudgetStatusResponse,
} from "./budget.types";

export class BudgetService {
  static async createBudget(userId: string, dto: CreateBudgetDTO) {
    let categoryObjectId: Types.ObjectId | null = null;

    if (dto.categoryId) {
      const category = await Category.findOne({
        _id: new Types.ObjectId(dto.categoryId),
        userId: new Types.ObjectId(userId),
      });

      if (!category) {
        throw new AppError("Category not found or unauthorized", 404);
      }
      categoryObjectId = category._id;
    }

    // Validate period match
    if (dto.period === "daily" && !/^\d{4}-\d{2}-\d{2}$/.test(dto.applicablePeriod)) {
      throw new AppError("Applicable period for daily budget must be in YYYY-MM-DD format", 400);
    }
    if (dto.period === "monthly" && !/^\d{4}-\d{2}$/.test(dto.applicablePeriod)) {
      throw new AppError("Applicable period for monthly budget must be in YYYY-MM format", 400);
    }

    // Check for existing duplicate budget
    const existing = await Budget.findOne({
      userId: new Types.ObjectId(userId),
      period: dto.period,
      applicablePeriod: dto.applicablePeriod,
      categoryId: categoryObjectId,
    });

    if (existing) {
      throw new AppError("A budget already exists for this category and period", 409);
    }

    const budget = await Budget.create({
      userId: new Types.ObjectId(userId),
      categoryId: categoryObjectId,
      period: dto.period,
      limitPaise: dto.limitPaise,
      applicablePeriod: dto.applicablePeriod,
      alertThreshold: dto.alertThreshold || 80,
    });

    return budget.populate("categoryId", "name icon color");
  }

  static async getBudgetsWithProgress(
    userId: string,
    filter: { period?: "daily" | "monthly"; applicablePeriod?: string },
    timezoneOffsetMinutes = 0
  ): Promise<BudgetStatusResponse[]> {
    const query: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    if (filter.period) query.period = filter.period;
    if (filter.applicablePeriod) query.applicablePeriod = filter.applicablePeriod;

    const budgets = await Budget.find(query).populate("categoryId", "name icon color").lean();

    const results: BudgetStatusResponse[] = [];

    for (const budget of budgets) {
      let startDate: Date;
      let endDate: Date;

      if (budget.period === "daily") {
        const bounds = getDayBoundaries(budget.applicablePeriod, timezoneOffsetMinutes);
        startDate = bounds.start;
        endDate = bounds.end;
      } else {
        const [yearStr, monthStr] = budget.applicablePeriod.split("-");
        const year = parseInt(yearStr || "", 10);
        const month = parseInt(monthStr || "", 10);
        const bounds = getMonthBoundaries(year, month, timezoneOffsetMinutes);
        startDate = bounds.start;
        endDate = bounds.end;
      }

      const expenseMatch: Record<string, any> = {
        userId: new Types.ObjectId(userId),
        type: "expense", // Only expenses, exclude income
        date: { $gte: startDate, $lte: endDate },
      };

      if (budget.categoryId) {
        expenseMatch.categoryId = (budget.categoryId as any)._id || budget.categoryId;
      }

      const spendingResult = await Expense.aggregate([
        { $match: expenseMatch },
        { $group: { _id: null, totalSpent: { $sum: "$amountPaise" } } },
      ]);

      const spentPaise = spendingResult[0]?.totalSpent || 0;
      const remainingPaise = Math.max(0, budget.limitPaise - spentPaise);
      const percentageConsumed =
        budget.limitPaise > 0
          ? Number(((spentPaise / budget.limitPaise) * 100).toFixed(1))
          : 0;

      const isExceeded = spentPaise > budget.limitPaise;
      const isWarning =
        !isExceeded && percentageConsumed >= (budget.alertThreshold || 80);

      const cat = budget.categoryId as any;

      results.push({
        id: budget._id.toString(),
        category: cat
          ? {
              id: cat._id.toString(),
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
            }
          : null,
        period: budget.period,
        limitPaise: budget.limitPaise,
        applicablePeriod: budget.applicablePeriod,
        alertThreshold: budget.alertThreshold,
        spentPaise,
        remainingPaise,
        percentageConsumed,
        isWarning,
        isExceeded,
      });
    }

    return results;
  }

  static async updateBudget(userId: string, budgetId: string, dto: UpdateBudgetDTO) {
    const budget = await Budget.findOne({
      _id: new Types.ObjectId(budgetId),
      userId: new Types.ObjectId(userId),
    });

    if (!budget) {
      throw new AppError("Budget not found", 404);
    }

    if (dto.limitPaise !== undefined) budget.limitPaise = dto.limitPaise;
    if (dto.alertThreshold !== undefined) budget.alertThreshold = dto.alertThreshold;

    await budget.save();
    return budget.populate("categoryId", "name icon color");
  }

  static async deleteBudget(userId: string, budgetId: string) {
    const result = await Budget.findOneAndDelete({
      _id: new Types.ObjectId(budgetId),
      userId: new Types.ObjectId(userId),
    });

    if (!result) {
      throw new AppError("Budget not found", 404);
    }

    return { deletedBudgetId: budgetId };
  }
}

