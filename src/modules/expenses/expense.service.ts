import { Types } from "mongoose";
import { Expense } from "./expense.model";
import { Category } from "../categories/category.model";
import { AppError } from "../../utils/AppError";
import {
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ExpenseFilterQuery,
} from "./expense.types";

export class ExpenseService {
  static async createExpense(userId: string, dto: CreateExpenseDTO) {
    // Validate category exists and belongs to the authenticated user
    const category = await Category.findOne({
      _id: new Types.ObjectId(dto.categoryId),
      userId: new Types.ObjectId(userId),
    });

    if (!category) {
      throw new AppError("Invalid category selected. Category not found or unauthorized.", 404);
    }

    const expenseDate = dto.date ? new Date(dto.date) : new Date();
    if (isNaN(expenseDate.getTime())) {
      throw new AppError("Invalid date provided", 400);
    }

    const expense = await Expense.create({
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(dto.categoryId),
      amountPaise: dto.amountPaise,
      description: dto.description || "",
      type: dto.type || "expense",
      date: expenseDate,
      paymentMethod: dto.paymentMethod || "upi",
    });

    return expense.populate("categoryId", "name icon color");
  }

  static async getExpenses(userId: string, query: ExpenseFilterQuery) {
    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.type) {
      filter.type = query.type;
    }

    if (query.categoryId) {
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) {
        filter.date.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        // If YYYY-MM-DD is supplied, make sure it covers through the end of that day
        const end = new Date(query.endDate);
        if (query.endDate.length === 10) {
          end.setUTCHours(23, 59, 59, 999);
        }
        filter.date.$lte = end;
      }
    }

    if (query.search && query.search.trim()) {
      filter.description = { $regex: query.search.trim(), $options: "i" };
    }

    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const sortField = query.sortBy || "date";
    const sortDirection = query.sortOrder === "asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [items, total] = await Promise.all([
      Expense.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("categoryId", "name icon color")
        .lean(),
      Expense.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getExpenseById(userId: string, expenseId: string) {
    const expense = await Expense.findOne({
      _id: new Types.ObjectId(expenseId),
      userId: new Types.ObjectId(userId),
    }).populate("categoryId", "name icon color");

    if (!expense) {
      throw new AppError("Expense not found", 404);
    }

    return expense;
  }

  static async updateExpense(userId: string, expenseId: string, dto: UpdateExpenseDTO) {
    const expense = await Expense.findOne({
      _id: new Types.ObjectId(expenseId),
      userId: new Types.ObjectId(userId),
    });

    if (!expense) {
      throw new AppError("Expense not found", 404);
    }

    if (dto.categoryId && dto.categoryId !== expense.categoryId.toString()) {
      const category = await Category.findOne({
        _id: new Types.ObjectId(dto.categoryId),
        userId: new Types.ObjectId(userId),
      });

      if (!category) {
        throw new AppError("Invalid category selected", 404);
      }
      expense.categoryId = new Types.ObjectId(dto.categoryId);
    }

    if (dto.amountPaise !== undefined) expense.amountPaise = dto.amountPaise;
    if (dto.description !== undefined) expense.description = dto.description;
    if (dto.type !== undefined) expense.type = dto.type;
    if (dto.paymentMethod !== undefined) expense.paymentMethod = dto.paymentMethod;
    if (dto.date !== undefined) {
      const parsedDate = new Date(dto.date);
      if (isNaN(parsedDate.getTime())) {
        throw new AppError("Invalid date provided", 400);
      }
      expense.date = parsedDate;
    }

    await expense.save();
    return expense.populate("categoryId", "name icon color");
  }

  static async deleteExpense(userId: string, expenseId: string) {
    const result = await Expense.findOneAndDelete({
      _id: new Types.ObjectId(expenseId),
      userId: new Types.ObjectId(userId),
    });

    if (!result) {
      throw new AppError("Expense not found", 404);
    }

    return { deletedExpenseId: expenseId };
  }
}

